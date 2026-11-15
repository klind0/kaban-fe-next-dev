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
 * Extracts the identifier (property_id or database ID) from a slug string.
 * KID IDs may contain either a timestamp or a UUID after the prefix.
 */
export function extractIdFromSlug(slug: string): string {
  if (!slug) return "";

  // Match the complete KID property ID before trying its UUID-shaped suffix.
  const kidMatch = slug.match(
    /(KID-(?:\d+|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}))$/i,
  );
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

  // Remove a trailing KID ID, 24-char MongoDB ObjectId, or UUID.
  const cleanSlug = slug.replace(
    /-(KID-(?:\d+|[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})|[a-f0-9]{24}|[a-f0-9-]{36})$/i,
    "",
  );

  return cleanSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}