"use client";

import Carousel from "@/components/universal/carousel";
import SectionTitle from "./section-title";
import { useQuery } from "@tanstack/react-query";
import { FEATURED_LISTINGS_QUERY } from "@/network/gql/listings.ql";
import { gqlRequest } from "@/network/graphql-client";
import { QUERY_KEY } from "@/enum/queryKeys";
import ListingCard, { ListingCardSkeleton } from "@/components/universal/listing-card";
import { IListing, IListingResponse } from "@/types/listingTypes";

type Props = {
  initialListings?: IListing[];
};

export default function FeaturedListingSection({
  initialListings = [],
}: Props) {
  const { data: featuredListingData, isLoading, isFetching } = useQuery({
    queryKey: [QUERY_KEY.FEATURED_LISTINGS],
    queryFn: () =>
      gqlRequest<{ featuredListings: IListingResponse }>(
        FEATURED_LISTINGS_QUERY,
      ),
    initialData:
      initialListings.length > 0
        ? { featuredListings: { data: initialListings } as IListingResponse }
        : undefined,
    staleTime: 60_000,
  });

  const listings =
    featuredListingData?.featuredListings?.data ?? initialListings ?? [];

  const slides = (listings ?? [])
    .filter(Boolean)
    .map((listing) => (
      <ListingCard key={listing?.id} listingData={listing} />
    ));

  const showSkeleton =
    listings.length === 0 && (isLoading || isFetching);

  return (
    <section className="bg-neutral-25">
      <div className="container mx-auto px-4 2xl:px-0 py-8 md:py-16">
        <SectionTitle
          title="Explore Our Featured Listings"
          subtitle="Properties considered worth your time by listing realtors"
        />
        {showSkeleton ? (
          <div className="mt-16 flex flex-col md:flex-row gap-8">
            {[1, 2, 3].map((item) => (
              <ListingCardSkeleton key={item} />
            ))}
          </div>
        ) : (
          <Carousel className="mt-16" autoAdvanceMs={5000}>
            {...(slides ?? [])}
          </Carousel>
        )}
      </div>
    </section>
  );
}