import React from "react";
import HomeScreen from "@/screens/public-pages/home";
import FeaturedListingSection from "@/components/public-pages/homepage/featured-listing-section";
import LatestAddition from "@/components/public-pages/homepage/latest-addition";
import SectionTitle from "@/components/public-pages/homepage/section-title";
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

async function FeaturedListings() {
  let initialListings: IListing[] = [];

  try {
    const result = await serverPublicGqlRequest<{
      featuredListings: unknown;
    }>(FEATURED_LISTINGS_QUERY, undefined, {
      revalidate: 60,
      tags: ["featured-listings"],
    });
    initialListings = unwrapListings(result.featuredListings);
  } catch (error) {
    console.error("Failed to load homepage featured listings", error);
  }

  return <FeaturedListingSection initialListings={initialListings} />;
}

async function LatestListings() {
  let initialListings: IListing[] = [];

  try {
    const result = await serverPublicGqlRequest<{
      publicListings: unknown;
    }>(
      PUBLIC_LISTINGS_QUERY,
      { filter: { limit: 6, page: 1 } },
      { revalidate: 60, tags: ["public-listings", "latest-listings"] },
    );
    initialListings = unwrapListings(result.publicListings);
  } catch (error) {
    console.error("Failed to load homepage latest listings", error);
  }

  return <LatestAddition initialListings={initialListings} />;
}

function ListingsFallback({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="bg-neutral-25" aria-label={title}>
      <div className="container mx-auto px-4 2xl:px-0 py-8 md:py-16">
        <SectionTitle title={title} subtitle={subtitle} />
        <div className="mt-16 flex gap-8 overflow-hidden" aria-hidden="true">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-133 w-full max-w-134.5 shrink-0 animate-pulse rounded-[10px] bg-neutral-200"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const featuredSection = (
    <React.Suspense
      fallback={
        <ListingsFallback
          title="Explore Our Featured Listings"
          subtitle="Properties considered worth your time by listing realtors"
        />
      }
    >
      <FeaturedListings />
    </React.Suspense>
  );
  const latestSection = (
    <React.Suspense
      fallback={
        <ListingsFallback
          title="Tour our Latest Additions"
          subtitle="Experience the newest and most recent listings first hand by taking a captivating tour of our latest additions as they are being published live by realtors."
        />
      }
    >
      <LatestListings />
    </React.Suspense>
  );

  return (
    <HomeScreen
      featuredSection={featuredSection}
      latestSection={latestSection}
    />
  );
}