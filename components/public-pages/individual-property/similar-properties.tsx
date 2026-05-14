"use client";

import ListingCard, { ListingCardSkeleton } from "@/components/universal/listing-card";
import { QUERY_KEY } from "@/enum/queryKeys";
import { FEATURED_LISTINGS_QUERY } from "@/network/gql/listings.ql";
import { gqlRequest } from "@/network/graphql-client";
import { IListingResponse } from "@/types/listingTypes";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function SimilarProperties() {
    const { data: featuredListingData, isLoading } = useQuery({
        queryKey: [QUERY_KEY.FEATURED_LISTINGS],
        queryFn: () => gqlRequest<{ featuredListings: IListingResponse }>(FEATURED_LISTINGS_QUERY, { limit: 3 }),
    })

    const listings = featuredListingData?.featuredListings?.data ?? [];

    return (
        <div className="mt-8 px-4 md:px-0">
            <div className="flex items-center justify-between flex-wrap">
                <h5 className="text-foreground">Similar Property listings you may like</h5>
                <Link href="/search" className="text-sm font-medium text-primary hover:underline">View all similar listings</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                {isLoading && [1, 2, 3].map((_, index) => <ListingCardSkeleton key={index} />)}
                {listings.map((listing) => (
                    <ListingCard key={listing.id} listingData={listing} />
                ))}
            </div>
        </div>
    )
}
