import type { MetadataRoute } from "next";
import { PUBLIC_LISTINGS_QUERY } from "@/network/gql/listings.ql";
import { serverPublicGqlRequest } from "@/network/server-public-graphql";
import { generateListingSlug } from "@/lib/manageSlug";
import type { IListing, IListingResponse } from "@/types/listingTypes";

export const revalidate = 3600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaban.ng"
).replace(/\/+$/, "");

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/search", changeFrequency: "daily", priority: 0.9 },
  { path: "/property/residential", changeFrequency: "daily", priority: 0.8 },
  { path: "/property/commercial", changeFrequency: "daily", priority: 0.8 },
  { path: "/property/industrial", changeFrequency: "daily", priority: 0.8 },
  { path: "/realtors/agencies", changeFrequency: "weekly", priority: 0.6 },
  { path: "/realtors/agents", changeFrequency: "weekly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/company/about-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/company/contact-us", changeFrequency: "monthly", priority: 0.5 },
  { path: "/company/faqs", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
];

function unwrapListings(payload: unknown): IListing[] {
  if (Array.isArray(payload)) return payload as IListing[];

  if (typeof payload === "object" && payload !== null) {
    const response = payload as Partial<IListingResponse>;
    if (Array.isArray(response.data)) return response.data;
  }

  return [];
}

async function fetchAllListings(): Promise<IListing[]> {
  const limit = 100;
  const listings: IListing[] = [];

  try {
    let page = 1;
    let totalPages = 1;

    do {
      const result = await serverPublicGqlRequest<{
        publicListings: IListingResponse | IListing[];
      }>(
        PUBLIC_LISTINGS_QUERY,
        { filter: { page, limit } },
        { revalidate: 3600, tags: ["public-listings", "sitemap"] },
      );

      const payload = result.publicListings;
      const pageListings = unwrapListings(payload);
      listings.push(...pageListings);

      if (typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
        const reportedPages = payload.meta?.totalPages;
        if (typeof reportedPages === "number" && reportedPages > 0) {
          totalPages = reportedPages;
        } else if (pageListings.length < limit) {
          totalPages = page;
        }
      } else if (pageListings.length < limit) {
        totalPages = page;
      }

      page += 1;
    } while (page <= totalPages && page <= 100);
  } catch (error) {
    console.error("Failed to generate dynamic sitemap listings", error);
  }

  return listings;
}

function getListingDate(listing: IListing): Date | undefined {
  const value = listing.publishedAt || listing.createdAt;
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency,
      priority,
    }),
  );

  const listings = await fetchAllListings();
  const seen = new Set<string>();
  const listingEntries: MetadataRoute.Sitemap = [];

  for (const listing of listings) {
    const slug = generateListingSlug(listing);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    listingEntries.push({
      url: `${SITE_URL}/property/${encodeURI(slug)}`,
      lastModified: getListingDate(listing),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return [...staticEntries, ...listingEntries];
}
