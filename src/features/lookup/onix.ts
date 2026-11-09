import { XMLParser } from 'fast-xml-parser';

import { normalizeForCompare } from '@/lib/text';

import { toLanguageCode } from './language-codes';

import type { LookupAuthor, LookupResult } from './types';

// Parses the ONIX 3.0 (reference tags) documents returned by the e-ISBN API.
// Code lists: https://www.editeur.org/14/code-lists/

const REPEATED = new Set([
  'Product',
  'ProductIdentifier',
  'TitleDetail',
  'TitleElement',
  'Contributor',
  'Language',
  'Subject',
  'Extent',
  'Publisher',
  'PublishingDate',
  'TextContent',
  'SupportingResource',
  'ResourceVersion',
]);

const parser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  parseTagValue: false,
  isArray: (name) => REPEATED.has(name),
});

type Contributor = {
  ContributorRole?: string;
  PersonNameInverted?: string;
  PersonName?: string;
};

type OnixProduct = {
  ProductIdentifier?: { ProductIDType?: string; IDValue?: string }[];
  DescriptiveDetail?: {
    TitleDetail?: {
      TitleType?: string;
      TitleElement?: { TitleText?: string; Subtitle?: string }[];
    }[];
    Contributor?: Contributor[];
    Language?: { LanguageRole?: string; LanguageCode?: string }[];
    Subject?: { SubjectSchemeIdentifier?: string; SubjectCode?: string }[];
    Extent?: { ExtentType?: string; ExtentValue?: string; ExtentUnit?: string }[];
  };
  CollateralDetail?: {
    TextContent?: { TextType?: string; Text?: string }[];
    SupportingResource?: {
      ResourceContentType?: string;
      ResourceVersion?: { ResourceLink?: string }[];
    }[];
  };
  PublishingDetail?: {
    Imprint?: { ImprintName?: string };
    Publisher?: { PublishingRole?: string; PublisherName?: string }[];
    PublishingDate?: { PublishingDateRole?: string; Date?: string }[];
  };
};

// ContributorRole codes, most to least preferred as book authors: A01 "By (author)" and
// A02 "With"; Z99 "Other", which e-ISBN often uses for authors; any other A* author role;
// B01 "Edited by" for edited volumes without authors.
const AUTHOR_ROLE_TIERS: ((role: string) => boolean)[] = [
  (role) => role === 'A01' || role === 'A02',
  (role) => role === 'Z99',
  (role) => role.startsWith('A'),
  (role) => role === 'B01',
];

/** Removes library-catalogue punctuation, e.g. "sylwetka duchowa /" or "Kraków :". */
function cleanText(value: string | undefined): string | undefined {
  const cleaned = value?.replace(/[\s/:;,=]+$/, '').trim();
  return cleaned || undefined;
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** "Radzyński, Przemysław" -> "Przemysław Radzyński". */
function uninvertName(name: string): string {
  const parts = name.split(',').map((part) => part.trim());
  if (parts.length !== 2 || !parts[1]) return name.trim();
  return `${parts[1]} ${parts[0]}`;
}

/** "20251230" -> "2025-12-30", "202512" -> "2025-12", "2025" -> "2025". */
function formatOnixDate(date: string | undefined): string | undefined {
  const match = date?.match(/^(\d{4})(\d{2})?(\d{2})?/);
  if (!match) return undefined;
  return match.slice(1).filter(Boolean).join('-');
}

function pickAuthors(contributors: Contributor[], publisherNames: string[]): LookupAuthor[] {
  const publishers = publisherNames.map(normalizeForCompare).filter(Boolean);

  const people = contributors
    .map((c) => ({
      role: c.ContributorRole ?? '',
      // Drops life dates, e.g. "Korytko Jan (1925-)".
      name: cleanText(
        (c.PersonNameInverted ?? c.PersonName)?.replace(/\s*\([^)]*\d[^)]*\)\s*$/, ''),
      ),
    }))
    .filter((p): p is { role: string; name: string } => !!p.name)
    // Publishers frequently appear as contributors, e.g. "Wydawnictwo M".
    .filter(({ name }) => {
      const normalized = normalizeForCompare(name);
      return !publishers.some((p) => p.includes(normalized) || normalized.includes(p));
    });

  for (const matchesTier of AUTHOR_ROLE_TIERS) {
    const names = people.filter((p) => matchesTier(p.role)).map((p) => uninvertName(p.name));
    if (names.length) return [...new Set(names)].map((name) => ({ name }));
  }
  return [];
}

function mapProduct(product: OnixProduct, isbn: string): LookupResult | null {
  const detail = product.DescriptiveDetail ?? {};
  const collateral = product.CollateralDetail ?? {};
  const publishing = product.PublishingDetail ?? {};

  // TitleType 01: distinctive title.
  const titleDetail =
    detail.TitleDetail?.find((t) => t.TitleType === '01') ?? detail.TitleDetail?.[0];
  const titleElement = titleDetail?.TitleElement?.[0];
  const title = cleanText(titleElement?.TitleText);
  if (!title) return null;

  // PublishingRole 01: publisher.
  const publisher =
    publishing.Publisher?.find((p) => p.PublishingRole === '01') ?? publishing.Publisher?.[0];
  const publisherName = cleanText(publisher?.PublisherName);
  const imprintName = cleanText(publishing.Imprint?.ImprintName);

  // PublishingDateRole 01: publication date.
  const publishingDate =
    publishing.PublishingDate?.find((d) => d.PublishingDateRole === '01') ??
    publishing.PublishingDate?.[0];

  // TextType 03: description, 02: short description.
  const texts = collateral.TextContent ?? [];
  const descriptionHtml = (
    texts.find((t) => t.TextType === '03') ?? texts.find((t) => t.TextType === '02')
  )?.Text;

  // ResourceContentType 01: front cover.
  const cover = collateral.SupportingResource?.find((r) => r.ResourceContentType === '01');

  // ExtentType 00: main content page count, 11: content page count. ExtentUnit 03: pages.
  const extent = detail.Extent?.find(
    (e) => (e.ExtentType === '00' || e.ExtentType === '11') && e.ExtentUnit === '03',
  );
  const pageCount = extent?.ExtentValue ? Number.parseInt(extent.ExtentValue, 10) : NaN;

  // LanguageRole 01: language of text.
  const languageCode = (
    detail.Language?.find((l) => l.LanguageRole === '01') ?? detail.Language?.[0]
  )?.LanguageCode;

  // SubjectSchemeIdentifier 20: keywords.
  const subjects = (detail.Subject ?? [])
    .filter((s) => s.SubjectSchemeIdentifier === '20')
    .map((s) => cleanText(s.SubjectCode))
    .filter((s): s is string => !!s);

  return {
    source: 'e-isbn',
    isbn,
    title,
    subtitle: cleanText(titleElement?.Subtitle),
    authors: pickAuthors(
      detail.Contributor ?? [],
      [publisherName, imprintName].filter((n): n is string => !!n),
    ),
    publisher: publisherName ?? imprintName,
    publicationDate: formatOnixDate(publishingDate?.Date),
    description: descriptionHtml ? stripHtml(descriptionHtml) : undefined,
    pageCount: pageCount > 0 ? pageCount : undefined,
    coverUrl: cover?.ResourceVersion?.[0]?.ResourceLink,
    language: toLanguageCode(languageCode),
    subjects: subjects.length ? subjects : undefined,
  };
}

/** Maps the product with the given ISBN-13 from an ONIX message, or null if it is not present. */
export function parseOnixProduct(xml: string, isbn13: string): LookupResult | null {
  const doc = parser.parse(xml) as { ONIXMessage?: { Product?: OnixProduct[] } };
  const products = doc.ONIXMessage?.Product ?? [];

  // ProductIDType 15: ISBN-13.
  const product = products.find((p) =>
    p.ProductIdentifier?.some((id) => id.ProductIDType === '15' && id.IDValue === isbn13),
  );
  return product ? mapProduct(product, isbn13) : null;
}
