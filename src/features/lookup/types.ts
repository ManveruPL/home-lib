export type LookupAuthor = {
  name: string;
  /** Open Library author key, e.g. "OL34184A", used for profile enrichment. */
  openLibraryKey?: string;
};

export type LookupResult = {
  source: 'e-isbn' | 'open-library';
  isbn: string;
  title: string;
  subtitle?: string;
  authors: LookupAuthor[];
  publisher?: string;
  publicationDate?: string;
  description?: string;
  pageCount?: number;
  coverUrl?: string;
  language?: string;
  /** Subject keywords from the source; candidates for genre tags. */
  subjects?: string[];
};

export type AuthorDetails = {
  name: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
};

/** A metadata source returns null when the ISBN is not found, and throws on network or API errors. */
export type LookupSource = (isbn: string) => Promise<LookupResult | null>;
