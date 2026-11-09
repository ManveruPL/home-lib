export const OWNERSHIP_STATUSES = ['OWNED', 'WISHLIST'] as const;
export type OwnershipStatus = (typeof OWNERSHIP_STATUSES)[number];

export const READING_STATUSES = ['TO_READ', 'READING', 'COMPLETED', 'PAUSED'] as const;
export type ReadingStatus = (typeof READING_STATUSES)[number];
