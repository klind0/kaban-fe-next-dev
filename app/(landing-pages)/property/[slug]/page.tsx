import IndividualProperty from "@/screens/public-pages/property";
import { extractIdFromSlug, generateListingSlug, slugToTitle } from "@/lib/manageSlug";
import { serverGqlRequest } from "@/network/server-graphql-client";
import { PUBLIC_INDIVIDUAL_LISTING_QUERY } from "@/network/gql/listings.ql";
import { IListing, IndividualListingResponse } from "@/types/listingTypes";
import { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import React from "react";

export const dynamic = "force-dynamic";

interface PropertyPageProps {
    params: Promise<{ slug: string }>;
}

const fetchListing = async (slug: string): Promise<IListing | null> => {
    const id = extractIdFromSlug(slug);
    try {
        const data = await serverGqlRequest<{ publicListing: IndividualListingResponse }>(
            PUBLIC_INDIVIDUAL_LISTING_QUERY,
            { id },
        );
        return data?.publicListing ?? null;
    } catch {
        return null;
    }
};

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
    const { slug } = await params;
    const listing = await fetchListing(slug);

    if (listing?.title) {
        const title = listing.title;
        const description = listing.description
            ? listing.description.slice(0, 160)
            : `${listing.details?.bedroom ?? 0} bedroom ${listing.property_type} for ${listing.status} in ${listing.location?.city}, ${listing.location?.state}`;
        const image = listing.cover_image || listing.images?.[0]?.url;
        const canonicalSlug = generateListingSlug(listing);

        return {
            title: `${title} | Kaban.ng`,
            description,
            alternates: {
                canonical: `/property/${canonicalSlug}`,
            },
            openGraph: {
                title: `${title} | Kaban.ng`,
                description,
                url: `/property/${canonicalSlug}`,
                ...(image && { images: [{ url: image }] }),
            },
            twitter: {
                card: "summary_large_image",
                title: `${title} | Kaban.ng`,
                description,
                ...(image && { images: [image] }),
            },
        };
    }

    // Clean fallback if listing isn't loaded yet
    const fallbackTitle = slugToTitle(slug);
    return {
        title: fallbackTitle ? `${fallbackTitle} | Kaban.ng` : "Property Details | Kaban.ng",
        description: "View property details on Kaban.ng",
    };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
    const { slug } = await params;
    const listing = await fetchListing(slug);

    if (listing) {
        const canonicalSlug = generateListingSlug(listing);

        // Redirect to canonical URL if the incoming slug doesn't match the standard format
        if (slug !== canonicalSlug) {
            permanentRedirect(`/property/${canonicalSlug}`);
        }
    }

    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <IndividualProperty slug={slug} initialData={listing} />
        </React.Suspense>
    );
}