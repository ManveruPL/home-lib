import { toLanguageCode } from './language-codes';
import type { AuthorDetails, LookupResult, LookupSource } from './types';

const BASE_URL = 'https://openlibrary.org';

// The `/api/books?bibkeys=…&jscmd=data` endpoint from the original spec now answers 404;
// the Read API returns the same `data` object per edition.
// Docs: https://openlibrary.org/dev/docs/api/read
type OpenLibraryBook = {
  title: string;
  subtitle?: string;
  publishers?: { name: string }[];
  publish_date?: string;
  number_of_pages?: number;
  cover?: { small?: string; medium?: string; large?: string };
  authors?: { name: string; url?: string }[];
};

type ReadApiResponse =
  // Not found: an empty array.
  | []
  | {
      records: Record<
        string,
        {
          data: OpenLibraryBook;
          details?: { details?: { languages?: { key: string }[] } };
        }
      >;
    };

type OpenLibraryAuthor = {
  name: string;
  bio?: string | { value: string };
  birth_date?: string;
  death_date?: string;
};

function authorKeyFromUrl(url?: string): string | undefined {
  return url?.match(/\/authors\/(OL\w+A)/)?.[1];
}

export const lookupOpenLibrary: LookupSource = async (isbn) => {
  const res = await fetch(`${BASE_URL}/api/volumes/brief/isbn/${isbn}.json`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Library responded with ${res.status}`);

  const json = (await res.json()) as ReadApiResponse;
  const record = Array.isArray(json) ? undefined : Object.values(json.records)[0];
  if (!record?.data?.title) return null;

  const book = record.data;
  // "/languages/eng" -> "eng"
  const languageKey = record.details?.details?.languages?.[0]?.key.split('/').pop();

  return {
    source: 'open-library',
    isbn,
    title: book.title,
    subtitle: book.subtitle,
    authors: (book.authors ?? []).map((a) => ({
      name: a.name,
      openLibraryKey: authorKeyFromUrl(a.url),
    })),
    publisher: book.publishers?.[0]?.name,
    publicationDate: book.publish_date,
    pageCount: book.number_of_pages,
    coverUrl: book.cover?.large ?? book.cover?.medium ?? book.cover?.small,
    language: toLanguageCode(languageKey),
  } satisfies LookupResult;
};

export async function fetchOpenLibraryAuthor(key: string): Promise<AuthorDetails | null> {
  const res = await fetch(`${BASE_URL}/authors/${key}.json`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Library responded with ${res.status}`);

  const author = (await res.json()) as OpenLibraryAuthor;
  return {
    name: author.name,
    biography: typeof author.bio === 'string' ? author.bio : author.bio?.value,
    birthDate: author.birth_date,
    deathDate: author.death_date,
  };
}
