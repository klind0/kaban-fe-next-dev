import { IListing } from "@/types/listingTypes";

export function generateListingSlug(listing: IListing): string {
  const bedrooms = listing.details?.bedroom;
  const propertyType = listing.property_type ?? "";
  const status = listing.status ?? "";
  const address = listing.location?.address ?? "";
  const city = listing.location?.city ?? "";
  const state = listing.location?.state ?? "";
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

  // 1. First, check if the slug ends with a KID-xxxx pattern (case-insensitive)
  const kidMatch = slug.match(/(KID-\d+)$/i);
  if (kidMatch) return kidMatch[1];

  // 2. Check for a standard 24-char MongoDB ObjectId or 36-char UUID
  const hexMatch = slug.match(/([a-f0-9]{24}|[a-f0-9-]{36})$/i);
  if (hexMatch) return hexMatch[1];

  // 3. Fallback: return everything after the last hyphen
  const lastHyphenIndex = slug.lastIndexOf("-");
  if (lastHyphenIndex === -1) return slug;
  return slug.slice(lastHyphenIndex + 1);
}

export function slugToTitle(slug: string): string {
  if (!slug) return "";
  
  // Clean off KID-xxxx or MongoDB IDs before building title
  const cleanSlug = slug.replace(/-(KID-\d+|[a-f0-9]{24})$/i, "");
  return cleanSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}