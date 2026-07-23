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

// lib/manageSlug.ts

export function extractIdFromSlug(slug: string): string {
  if (!slug) return "";

  // 1. Matches backend IDs like "KID-1784201455352" or 24-char MongoDB ObjectIds at the end of the slug
  const match = slug.match(/(KID-\d+|[a-f0-9]{24})$/i);
  if (match) return match[1];

  // 2. Fallback for any other custom single-part ID format
  const lastHyphenIndex = slug.lastIndexOf("-");
  if (lastHyphenIndex === -1) return slug;
  return slug.slice(lastHyphenIndex + 1);
}

export function slugToTitle(slug: string): string {
  if (!slug) return "";
  
  // Strip out KID-xxxx or 24-char hex ID from the end before converting to title
  const cleanSlug = slug.replace(/-(KID-\d+|[a-f0-9]{24})$/i, "");
  return cleanSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}