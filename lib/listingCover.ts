import { IListing } from "@/types/listingTypes";

/** Resolve the display cover URL for any listing card */
export function getListingCoverUrl(
  listing: Pick<IListing, "cover_image" | "images"> | null | undefined,
  fallback = "",
): string {
  if (!listing) return fallback;

  const urls = (listing.images ?? [])
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter((u): u is string => Boolean(u));

  // Prefer cover_image when it points at a real listing image
  if (listing.cover_image && urls.includes(listing.cover_image)) {
    return listing.cover_image;
  }

  // Backend sometimes stores cover_image even if not in images[]
  if (listing.cover_image) {
    return listing.cover_image;
  }

  // Same as dashboard today: first image is cover after create/edit reorder
  return urls[0] || fallback;
}