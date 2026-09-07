import HomeScreen from "@/screens/public-pages/home";
import React from "react";
import { serverPublicGqlRequest } from "@/network/server-public-graphql";
import {
  FEATURED_LISTINGS_QUERY,
  PUBLIC_LISTINGS_QUERY,
} from "@/network/gql/listings.ql";
import { IListing } from "@/types/listingTypes";

function unwrapListings(payload: unknown): IListing[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as IListing[];
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    return Array.isArray(data) ? (data as IListing[]) : [];
  }
  return [];
}

export default async function Home() {
  const [featuredResult, latestResult] = await Promise.all([
    serverPublicGqlRequest<{ featuredListings: unknown }>(
      FEATURED_LISTINGS_QUERY,
      undefined,
      { revalidate: 60, tags: ["featured-listings"] },
    ).catch(() => null),
    serverPublicGqlRequest<{ publicListings: unknown }>(
      PUBLIC_LISTINGS_QUERY,
      { filter: { limit: 6, page: 1 } },
      { revalidate: 60, tags: ["public-listings", "latest-listings"] },
    ).catch(() => null),
  ]);

  const initialFeatured = unwrapListings(featuredResult?.featuredListings);
  const initialLatest = unwrapListings(latestResult?.publicListings);

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HomeScreen
        initialFeatured={initialFeatured}
        initialLatest={initialLatest}
      />
    </React.Suspense>
  );
}