"use client";

import Carousel from "@/components/universal/carousel";
import SectionTitle from "./section-title";
import ListingCard, { ListingCardSkeleton } from "@/components/universal/listing-card";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/enum/queryKeys";
import { gqlRequest } from "@/network/graphql-client";
import { IListing, IListingResponse } from "@/types/listingTypes";
import { PUBLIC_LISTINGS_QUERY } from "@/network/gql/listings.ql";

type Props = {
  initialListings?: IListing[];
};

export default function LatestAddition({ initialListings = [] }: Props) {
  const { data: publicListingData, isLoading, isFetching } = useQuery({
    queryKey: [QUERY_KEY.PUBLIC_LISTINGS, { limit: 6, page: 1 }],
    queryFn: () =>
      gqlRequest<{ publicListings: IListingResponse }>(
        PUBLIC_LISTINGS_QUERY,
        { filter: { limit: 6, page: 1 } },
      ),
    initialData:
      initialListings.length > 0
        ? { publicListings: { data: initialListings } as IListingResponse }
        : undefined,
    staleTime: 60_000,
  });

  const listings =
    publicListingData?.publicListings?.data ?? initialListings ?? [];

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
          title="Tour our Latest Additions"
          subtitle="Experience the newest and most recent listings first hand by taking a captivating tour of our latest additions as they are being published live by realtors."
        />
        {showSkeleton ? (
          <div className="mt-16 flex flex-col md:flex-row gap-8">
            {[1, 2, 3].map((item) => (
              <ListingCardSkeleton key={item} />
            ))}
          </div>
        ) : (
          <Carousel className="mt-16">{...(slides ?? [])}</Carousel>
        )}
      </div>
    </section>
  );
}