import { IListing } from "@/types/listingTypes";

/**
 * Generates an SEO-friendly canonical slug for property detail URLs.
 * Format: [bedrooms-bedroom]-[propertyType]-[statusLabel]-[address]-[city]-[state]-[identifier]
 */
export function generateListingSlug(listing: IListing): string {
  const bedrooms = listing.details?.bedroom;
  const propertyType = listing.property_type ?? "";
  const status = listing.status ?? "";
  const address = listing.location?.address ?? "";
  const city = listing.location?.city ?? "";
  const state = listing.location?.state ?? "";
  
  // Prefer custom property_id (e.g., KID-1784201455352), with fallbacks for MongoDB id
  const identifier = listing.property_id || listing.id || (listing as any)._id || "";

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

/**
 * Extracts the identifier (property_id or MongoDB ObjectId) from a slug string.
 * Handles hyphens inside KID- prefixed IDs safely.
 */
export function extractIdFromSlug(slug: string): string {
  if (!slug) return "";

  // 1. Matches KID-xxxx property IDs at the end of the slug (case-insensitive)
  const kidMatch = slug.match(/(KID-\d+)$/i);
  if (kidMatch) return kidMatch[1];

  // 2. Matches 24-char MongoDB ObjectIds or 36-char UUIDs at the end
  const hexMatch = slug.match(/([a-f0-9]{24}|[a-f0-9-]{36})$/i);
  if (hexMatch) return hexMatch[1];

  // 3. Fallback: return everything after the last hyphen
  const lastHyphenIndex = slug.lastIndexOf("-");
  if (lastHyphenIndex === -1) return slug;
  return slug.slice(lastHyphenIndex + 1);
}

/**
 * Converts a raw slug string back into a human-readable Title Case string
 * after stripping the trailing unique ID.
 */
export function slugToTitle(slug: string): string {
  if (!slug) return "";

  // Remove trailing KID-xxxx, 24-char MongoDB ObjectId, or UUID
  const cleanSlug = slug.replace(/-(KID-\d+|[a-f0-9]{24}|[a-f0-9-]{36})$/i, "");

  return cleanSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}