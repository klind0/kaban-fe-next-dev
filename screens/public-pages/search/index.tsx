'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, Rows, MapPin } from "lucide-react";

// Core UI Components
import Container from '@/components/universal/Container';
import ListingCard from '@/components/universal/listing-card';
import MobileMapControl from './components/MobileMapControl';
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
    
    // 💎 Advanced filter display panel visibility state
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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
                    status: "APPROVED", 
                    ...(activeFilters.property_type && { property_type: activeFilters.property_type }),
                    ...(activeFilters.bedroom && { "details.bedroom": Number(activeFilters.bedroom) }),
                },
                limit: 20,
            }),
    });

    const listings = searchData?.publicListings?.data ?? [];
    const totalResults = searchData?.publicListings?.total ?? 0;
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
        <Container element="section" className={`flex w-full min-h-screen bg-neutral-50/50 pb-12 ${!map ? 'md:gap-6 xl:pe-16' : 'md:gap-0 md:px-16'}`}>
            <div className={`transition-all delay-100 ${renderMap} ${mapPage}`}>
                <div className={'h-[95vh] top-4 sticky'}>
                    <Image src={'https://images.unsplash.com/photo-1524661135339-9140b00787e3?auto=format&fit=crop&w=800&q=80'} width={800} height={1000} className="w-full rounded-xl h-full object-cover object-top border border-slate-200" alt="Search map view" priority />
                </div>
            </div>

            <MobileMapControl setMap={setMap} stackOrder={stackOrder} setStackOrder={setStackOrder} />

            <div className="w-full space-y-5">
                <div className={`${stackOrder === 'map' && mediasize === 'mobile' && 'p-[3%] bg-neutral-100 fixed inset-x-0 top-0 max-h-[11.8rem] pt-20 w-screen z-10'}`}>
                    <div className="text-sm text-slate-400 mb-1 font-medium">
                        <Link href={'/'} className="text-blue-600 hover:underline">Home</Link>
                        <span> / Search</span>
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight text-slate-800 mb-4">Available Properties</h3>
                    
                    {/* 💎 3. White Control Bar Container Box */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm w-full mb-4">
                        <span className="text-sm font-semibold text-slate-600">
                            {totalResults} {totalResults === 1 ? 'Result' : 'Results'} Found
                        </span>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                <select className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer">
                                    <option>Default order</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>

                            <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50">
                                <button 
                                    onClick={() => setPosition('landscape')}
                                    className={`p-1.5 rounded-md transition-colors ${position === 'landscape' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Rows className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setPosition('portrait')}
                                    className={`p-1.5 rounded-md transition-colors ${position === 'portrait' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={toggleMap}
                                    className={`p-1.5 rounded-md transition-colors ml-1 border-l border-slate-200 pl-2 ${map ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <MapPin className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* 💎 1 & 2. Interactive Advanced Dropdown Filter Accordion Component */}
                    <div className={`w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6 ${stackOrder === 'map' && mediasize === 'mobile' ? 'opacity-0 invisible max-h-0' : ''}`}>
                        <button 
                            type="button"
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50/40 transition-colors text-left font-semibold text-sm text-slate-700"
                        >
                            <span>Advanced Filter Options</span>
                            {isAdvancedOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>

                        {isAdvancedOpen && (
                            <div className="p-5 border-t border-slate-100 bg-white space-y-5 transition-all duration-200">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-700">Radius Filter</label>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">0km</span>
                                    </div>
                                    <input type="range" min="0" max="100" className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                                        <input 
                                            type="text" 
                                            value={activeFilters.search || ''}
                                            onChange={(e) => setActiveFilters(p => ({ ...p, search: e.target.value }))}
                                            placeholder="Enter location..." 
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 bg-slate-50/30" 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Status</label>
                                        <select 
                                            value={activeFilters.status || ''} 
                                            onChange={(e) => setActiveFilters(p => ({ ...p, status: e.target.value || undefined }))}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-white outline-none focus:border-blue-500"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="RENT">Rent</option>
                                            <option value="SALE">Sale</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Type</label>
                                        <select 
                                            value={activeFilters.property_type || ''}
                                            onChange={(e) => setActiveFilters(p => ({ ...p, property_type: e.target.value || undefined }))}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-white outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select type...</option>
                                            <option value="APARTMENT">Apartment</option>
                                            <option value="HOUSE">House</option>
                                            <option value="COMMERCIAL">Commercial</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bedrooms</label>
                                        <select 
                                            value={activeFilters.bedroom || ''}
                                            onChange={(e) => setActiveFilters(p => ({ ...p, bedroom: e.target.value || undefined }))}
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 bg-white outline-none focus:border-blue-500"
                                        >
                                            <option value="">Any</option>
                                            <option value="1">1 Bedroom</option>
                                            <option value="2">2 Bedrooms</option>
                                            <option value="3">3 Bedrooms</option>
                                            <option value="4">4+ Bedrooms</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-16 text-center text-sm font-semibold text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
                        Loading properties matching your search...
                    </div>
                ) : listings.length === 0 ? (
                    <div className="py-16 text-center text-sm font-semibold text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
                        No properties found matching those search criteria.
                    </div>
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