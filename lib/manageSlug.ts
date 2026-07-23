import { IListing } from "@/types/listingTypes";

export function generateListingSlug(listing: IListing): string {
  const bedrooms = listing.details?.bedroom;
  const propertyType = listing.property_type ?? "";
  const status = listing.status ?? "";
  const address = listing.location?.address ?? "";
  const city = listing.location?.city ?? "";
  const state = listing.location?.state ?? "";
  // 1. Switched to property_id with a fallback to id
  const identifier = listing.property_id || listing.id || "";

  const statusLabel = status === "rent" ? "for-rent" : "for-sale";

  const parts = [];
  if (bedrooms && bedrooms > 0) {
    parts.push(`${bedrooms}-bedroom`);
  }
  parts.push(propertyType, statusLabel, address, city, state);
  const raw = parts.join(" ");

  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug}-${identifier}`;
}

export function extractIdFromSlug(slug: string): string {
  if (!slug) return "";
  
  // 2. Extracts everything after the final hyphen (works for both property_id and DB id)
  const lastHyphenIndex = slug.lastIndexOf("-");
  if (lastHyphenIndex === -1) return slug;
  return slug.slice(lastHyphenIndex + 1);
}

export function slugToTitle(slug: string): string {
  const lastHyphenIndex = slug.lastIndexOf("-");
  const base = lastHyphenIndex !== -1 ? slug.slice(0, lastHyphenIndex) : slug;
  return base
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}