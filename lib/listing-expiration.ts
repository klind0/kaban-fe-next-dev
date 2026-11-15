import { IListing } from "@/types/listingTypes";

const LISTING_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export function getListingExpirationDate(
  listing: Pick<IListing, "publishedAt">,
): Date | null {
  if (!listing.publishedAt) return null;

  const publishedAt = new Date(listing.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return null;

  return new Date(publishedAt.getTime() + LISTING_LIFETIME_MS);
}
