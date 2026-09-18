"use client";

import ListingCard, { ListingCardSkeleton } from "@/components/universal/listing-card";
import { QUERY_KEY } from "@/enum/queryKeys";
import { PUBLIC_LISTINGS_QUERY } from "@/network/gql/listings.ql";
import { gqlRequest } from "@/network/graphql-client";
import { IListing, IListingResponse } from "@/types/listingTypes";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface SimilarPropertiesProps {
  currentListing: IListing;
}

export default function SimilarProperties({
  currentListing,
}: SimilarPropertiesProps) {
  const city = currentListing?.location?.city;
  const state = currentListing?.location?.state;
  const category = currentListing?.property_category;
  const status = currentListing?.status;

  const { data, isLoading } = useQuery({
    queryKey: [
      QUERY_KEY.PUBLIC_LISTINGS,
      "similar",
      currentListing?.id,
      city,
      state,
      category,
      status,
    ],
    queryFn: () =>
      gqlRequest<{ publicListings: IListingResponse }>(PUBLIC_LISTINGS_QUERY, {
        filter: {
          page: 1,
          limit: 8,
          ...(city ? { city } : {}),
          ...(state ? { state } : {}),
          ...(category ? { property_category: category } : {}),
          ...(status ? { status } : {}),
        },
      }),
    enabled: !!currentListing,
  });

  const rawListings = data?.publicListings?.data ?? [];

  const similarListings = rawListings
    .filter(
      (item) =>
        item.id !== currentListing?.id &&
        item.property_id !== currentListing?.property_id,
    )
    .slice(0, 3);

  const searchParams = new URLSearchParams();
  if (city) searchParams.set("city", city);
  if (state) searchParams.set("state", state);
  if (category) searchParams.set("category", category);
  if (status) searchParams.set("status", String(status));

  const searchLink = `/search${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  return (
    <div className="mt-8 px-4 md:px-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h5 className="text-foreground font-semibold text-lg">
          Similar Property listings you may like
        </h5>
        <Link
          href={searchLink}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all similar listings
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {isLoading &&
          [1, 2, 3].map((_, index) => <ListingCardSkeleton key={index} />)}

        {!isLoading && similarListings.length > 0
          ? similarListings.map((listing) => (
              <ListingCard
                key={listing.id || listing.property_id}
                listingData={listing}
              />
            ))
          : !isLoading && (
              <div className="col-span-full py-8 text-center text-neutral-900 font-medium">
                No similar properties found in this area at the moment.
              </div>
            )}
      </div>
    </div>
  );
}