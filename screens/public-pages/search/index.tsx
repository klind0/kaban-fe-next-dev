'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

// Core UI Components
import Container from '@/components/universal/Container';
import ListingCard from '@/components/universal/listing-card';
import MobileMapControl from './components/MobileMapControl';
import SwitchGroup from './components/SwitchGroup';
import SearchForm from './components/searchForm/SearchForm';

// Assets & GraphQL Clients
import background from '@/app/assets/images/hero-bg.webp';
import { QUERY_KEY } from '@/enum/queryKeys';
import { gqlRequest } from '@/network/graphql-client';
import { PUBLIC_LISTINGS_QUERY } from '@/network/gql/listings.ql'; 
import { IListingResponse } from '@/types/listingTypes';
import useResponsiveNav from '@/hooks/useResponsiveNav';
import { IQueryParamsType } from '@/types/queryParamsType';

type ResultsProps = {
    initialSearchTerm?: string;
};

export default function SearchResultsPage({ initialSearchTerm }: ResultsProps) {
    const [position, setPosition] = useState<'portrait' | 'landscape'>('portrait');
    const [stackOrder, setStackOrder] = useState<'listings' | 'map'>('listings');
    const [map, setMap] = useState(false);

    // 💎 1. State tracker to manage all current active filter variables
    const [activeFilters, setActiveFilters] = useState<Partial<IQueryParamsType>>({
        search: initialSearchTerm || "",
        status: undefined,
        property_type: undefined,
        bedroom: undefined,
    });

    // Sync initial search string if it updates via route changes
    useEffect(() => {
        if (initialSearchTerm) {
            setActiveFilters(prev => ({ ...prev, search: initialSearchTerm }));
        }
    }, [initialSearchTerm]);

    // 💎 2. Pass dynamic filters directly into the query execution engine
    const { data: searchData, isLoading } = useQuery({
        queryKey: [QUERY_KEY.PUBLIC_LISTINGS, activeFilters],
        queryFn: () =>
            gqlRequest<{ publicListings: IListingResponse }>(PUBLIC_LISTINGS_QUERY, {
                filter: {
                    search: activeFilters.search || "",
                    status: "APPROVED", // Keeps internal drafts hidden
                    // Dynamically forward other structural inputs if they are selected
                    ...(activeFilters.property_type && { property_type: activeFilters.property_type }),
                    ...(activeFilters.bedroom && { "details.bedroom": Number(activeFilters.bedroom) }),
                },
                limit: 20,
            }),
    });

    const listings = searchData?.publicListings?.data ?? [];
    const { mediasize } = useResponsiveNav({});

    useEffect(() => {
        mediasize === 'mobile'
            ? stackOrder === 'map' ? setMap(false) : setMap(true)
            : setMap(false);
    }, [mediasize, stackOrder]);

    const toggleMap = () => setMap(!map);

    const listingsPage = stackOrder === 'listings' ? 'relative' : 'fixed w-0 overflow-hidden md:relative md:w-full md:overflow-auto';
    const order = position === 'portrait' ? 'grid-cols-[repeat(auto-fit,minmax(19rem,1fr))]' : 'grid-cols-[repeat(auto-fit,minmax(30rem,1fr))]';
    const mapPage = stackOrder === 'map' && mediasize === 'mobile' ? 'fixed top-[11rem] left-0 w-full' : '';
    const renderMap = !map ? 'w-[60%]' : 'w-0 opacity-0';

    return (
        <Container element="section" className={`flex w-full ${!map ? 'md:gap-4 xl:pe-16' : 'md:gap-0 md:px-16'}`}>
            <div className={`transition-all delay-100 ${renderMap} ${mapPage}`}>
                <div className={'h-[95vh] border-red-600 top-4 sticky'}>
                    <Image src={background} className="w-full rounded-lg h-full object-cover object-top" alt="Search map view" priority />
                </div>
            </div>

            <MobileMapControl setMap={setMap} stackOrder={stackOrder} setStackOrder={setStackOrder} />

            <div className={`w-full`}>
                <div className={`${stackOrder === 'map' && mediasize === 'mobile' && 'p-[3%] bg-neutral-100 fixed inset-x-0 top-0 max-h-[11.8rem] pt-20 w-screen'}`}>
                    <div className="text-sm text-neutral-500 mb-1">
                        <Link href={'/'} className="text-primary hover:underline">Home</Link>
                        <span> / Search</span>
                    </div>

                    <h3 className="text-2xl font-semibold capitalize mb-2">Available Properties</h3>
                    
                    <SwitchGroup mapState={map} onClick={toggleMap} stackOrder={stackOrder} orientation={position} setOrientation={setPosition} />
                    
                    {/* 💎 3. FIXED: Captures submitted modifications and refreshes your Query cache */}
                    <SearchForm
                        className={`${stackOrder === 'map' && mediasize === 'mobile' ? 'opacity-0 invisible max-h-0' : ''}`} 
                        onSearchSubmit={(filters) => {
                            setActiveFilters(prev => ({
                                ...prev,
                                ...filters
                            }));
                        }} 
                    />
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-neutral-500">Loading properties matching your search...</div>
                ) : listings.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500">No properties found matching those search criteria.</div>
                ) : (
                    <div className={`top-4 grid gap-4 transition-all delay-100 ${listingsPage} ${order}`}>
                        {listings.map((listing) => (
                            <ListingCard key={listing?.id} listingData={listing} />
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}