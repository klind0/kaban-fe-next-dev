'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, Rows, MapPin, Check } from "lucide-react";

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

// Available Amenities Core Matrix Data
const ALL_AMENITIES = [
    "Swimming Pool", "Fitted Kitchen", "In-built Speaker", "En-suite",
    "Boys Quarter", "Gym", "CCTV Cameras", "Security",
    "Furnished", "Elevator", "24-hrs Electricity", "Pre-paid Meter",
    "Installed Wardrobe", "Laundry Room", "Walk-in Closet", "Family Room"
];

// Custom Selection Dropdown Component for home page styling parity
function CustomSelect({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder = "Select..." 
}: { 
    label?: string; // 💎 Made optional by adding '?'
    value: string; 
    options: { label: string; value: string; isHeader?: boolean }[]; 
    onChange: (val: string) => void;
    placeholder?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div ref={containerRef} className="relative space-y-1 w-full">
            {/* Render label header only if a label prop is explicitly passed */}
            {label && (
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {label}
                </span>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between border rounded-lg p-2.5 text-sm bg-white transition-all text-left font-medium ${
                    isOpen ? 'border-[#006AFF] ring-1 ring-[#006AFF]/20 text-slate-800' : 'border-slate-200 text-slate-700'
                }`}
            >
                <span className="truncate">
                    {selectedOption && selectedOption.value !== "" ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#006AFF]' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-fadeIn">
                    {options.map((opt, i) => {
                        if (opt.isHeader) {
                            return (
                                <div key={i} className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                                    {opt.label}
                                </div>
                            );
                        }
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                                    value === opt.value ? 'text-[#006AFF] font-semibold bg-blue-50/40' : 'text-slate-600'
                                }`}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <Check className="w-4 h-4 text-[#006AFF]" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function SearchResultsPage({ initialSearchTerm }: ResultsProps) {
    const [position, setPosition] = useState<'portrait' | 'landscape'>('portrait');
    const [stackOrder, setStackOrder] = useState<'listings' | 'map'>('listings');
    const [map, setMap] = useState(false);
    
    // UI Panel Control States
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isRadiusActive, setIsRadiusActive] = useState(false);
    const [radiusValue, setRadiusValue] = useState(0);
    const [showOtherFeatures, setShowOtherFeatures] = useState(false);

    // Active Amenities Checklist State Array
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(ALL_AMENITIES);

    // Filter Variables State Tracker
    const [activeFilters, setActiveFilters] = useState<Partial<IQueryParamsType>>({
        search: initialSearchTerm || "",
        status: undefined,
        property_type: undefined,
        bedroom: undefined,
    });

    const [bathroomValue, setBathroomValue] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    useEffect(() => {
        if (initialSearchTerm) {
            setActiveFilters(prev => ({ ...prev, search: initialSearchTerm }));
        }
    }, [initialSearchTerm]);

    // Query Execution Pipeline
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
    const totalResults = listings.length;
    const { mediasize } = useResponsiveNav({});

    useEffect(() => {
        mediasize === 'mobile'
            ? stackOrder === 'map' ? setMap(false) : setMap(true)
            : setMap(false);
    }, [mediasize, stackOrder]);

    const toggleMap = () => setMap(!map);

    // Select-all check/uncheck management
    const handleSelectAllChange = (checked: boolean) => {
        if (checked) {
            setSelectedAmenities(ALL_AMENITIES);
        } else {
            setSelectedAmenities([]);
        }
    };

    const handleAmenityToggle = (amenity: string) => {
        setSelectedAmenities(prev => 
            prev.includes(amenity) 
                ? prev.filter(a => a !== amenity) 
                : [...prev, amenity]
        );
    };

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
                        <Link href={'/'} className="text-[#006AFF] hover:underline">Home</Link>
                        <span> / Search</span>
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight text-slate-800 mb-4">Available Properties</h3>
                    
                    {/* Floating Controls Row */}
                    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm w-full mb-4">
                        <span className="text-sm font-semibold text-slate-600">
                            {totalResults} {totalResults === 1 ? 'Result' : 'Results'} Found
                        </span>

                        <div className="flex items-center gap-3">
                            {/* Sort Order Selector */}
                            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                <select className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer">
                                    <option>Default order</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>

                            {/* 💎 View Switcher Buttons Container: Hidden on mobile, visible on desktop/tablet (md+) */}
                            <div className="hidden md:flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50">
                                <button 
                                    type="button"
                                    onClick={() => setPosition('landscape')}
                                    className={`p-1.5 rounded-md transition-colors ${position === 'landscape' ? 'bg-white text-[#006AFF] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Landscape View"
                                >
                                    <Rows className="w-4 h-4" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setPosition('portrait')}
                                    className={`p-1.5 rounded-md transition-colors ${position === 'portrait' ? 'bg-white text-[#006AFF] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={toggleMap}
                                    className={`p-1.5 rounded-md transition-colors ml-1 border-l border-slate-200 pl-2 ${map ? 'text-[#006AFF] font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                                    title="Toggle Map"
                                >
                                    <MapPin className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Accordion Filter Dashboard */}
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
                            <div className="p-5 border-t border-slate-100 bg-white space-y-6 transition-all duration-200">
                                
                                {/* 💎 Restored Custom Slider Container */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setIsRadiusActive(!isRadiusActive)}
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                isRadiusActive ? 'border-[#006AFF] bg-[#006AFF]' : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {isRadiusActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </button>
                                        <label 
                                            onClick={() => setIsRadiusActive(!isRadiusActive)}
                                            className="text-sm font-semibold text-slate-700 cursor-pointer select-none"
                                        >
                                            Radius Filter
                                        </label>
                                        <span className="ml-auto text-xs font-bold text-[#006AFF] bg-blue-50 px-2.5 py-0.5 rounded-full">
                                            {radiusValue}km
                                        </span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        disabled={!isRadiusActive}
                                        value={radiusValue}
                                        onChange={(e) => setRadiusValue(Number(e.target.value))}
                                        className={`w-full h-1 rounded-lg appearance-none cursor-pointer transition-opacity ${
                                            isRadiusActive ? 'accent-[#006AFF] bg-slate-200' : 'accent-slate-300 bg-slate-100 opacity-50 pointer-events-none'
                                        }`} 
                                    />
                                </div>

                                {/* Grid Layout Matching Exact Desktop & Mobile Mockups */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    {/* Row 1 / Location: Spans 2 cols on mobile and 2 cols on desktop */}
                                    <div className="col-span-2 md:col-span-2">
                                        <input 
                                            type="text" 
                                            value={activeFilters.search || ''}
                                            onChange={(e) => setActiveFilters(p => ({ ...p, search: e.target.value }))}
                                            placeholder="location" 
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 outline-none focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF]/20 bg-white font-medium placeholder:text-slate-400" 
                                        />
                                    </div>
                                    
                                    {/* Property Status */}
                                    <div className="col-span-1 md:col-span-1">
                                        <CustomSelect 
                                            value={activeFilters.status || ''}
                                            placeholder="Status"
                                            options={[
                                                { label: "All Statuses", value: "" },
                                                { label: "Rent", value: "RENT" },
                                                { label: "Sale", value: "SALE" }
                                            ]}
                                            onChange={(val) => setActiveFilters(p => ({ ...p, status: val || undefined }))}
                                        />
                                    </div>

                                    {/* Property Type */}
                                    <div className="col-span-1 md:col-span-1">
                                        <CustomSelect 
                                            value={activeFilters.property_type || ''}
                                            placeholder="Property Type"
                                            options={[
                                                { label: "Select type...", value: "" },
                                                { label: "Residential", value: "RESIDENTIAL_HDR", isHeader: true },
                                                { label: "Self Contain", value: "SELF_CONTAIN" },
                                                { label: "Apartment", value: "APARTMENT" },
                                                { label: "Detached House", value: "DETACHED" },
                                                { label: "Terrace House", value: "TERRACE" },
                                                { label: "Semi-detached House", value: "SEMI_DETACHED" },
                                                { label: "Commercial", value: "COMMERCIAL_HDR", isHeader: true },
                                                { label: "Commercial", value: "COMMERCIAL" }
                                            ]}
                                            onChange={(val) => setActiveFilters(p => ({ ...p, property_type: val || undefined }))}
                                        />
                                    </div>

                                    {/* Row 2 / Bedrooms */}
                                    <div className="col-span-1 md:col-span-1">
                                        <CustomSelect 
                                            value={activeFilters.bedroom?.toString() || ''}
                                            placeholder="Bedroom"
                                            options={[
                                                { label: "Any Bedroom", value: "" },
                                                { label: "1 Bedroom", value: "1" },
                                                { label: "2 Bedrooms", value: "2" },
                                                { label: "3 Bedrooms", value: "3" },
                                                { label: "4+ Bedrooms", value: "4" }
                                            ]}
                                            onChange={(val) => setActiveFilters(p => ({ ...p, bedroom: val ? Number(val) : undefined }))}
                                        />
                                    </div>

                                    {/* Bathrooms */}
                                    <div className="col-span-1 md:col-span-1">
                                        <CustomSelect 
                                            value={bathroomValue}
                                            placeholder="Bathroom"
                                            options={[
                                                { label: "Any Bathroom", value: "" },
                                                { label: "1 Bathroom", value: "1" },
                                                { label: "2 Bathrooms", value: "2" },
                                                { label: "3+ Bathrooms", value: "3" }
                                            ]}
                                            onChange={(val) => setBathroomValue(val)}
                                        />
                                    </div>

                                    {/* Min Price */}
                                    <div className="col-span-1 md:col-span-1">
                                        <input 
                                            type="number" 
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="Min.price" 
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 outline-none focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF]/20 bg-white font-medium placeholder:text-slate-400" 
                                        />
                                    </div>

                                    {/* Max Price */}
                                    <div className="col-span-1 md:col-span-1">
                                        <input 
                                            type="number" 
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="Max.price" 
                                            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 outline-none focus:border-[#006AFF] focus:ring-1 focus:ring-[#006AFF]/20 bg-white font-medium placeholder:text-slate-400" 
                                        />
                                    </div>
                                </div>

                                {/* Collapsible Other Features Header */}
                                <div className="pt-2 space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtherFeatures(!showOtherFeatures)}
                                        className="flex items-center gap-2 text-slate-700 font-medium text-sm select-none hover:text-[#006AFF] transition-colors"
                                    >
                                        <span className="flex items-center justify-center border border-slate-300 rounded-md w-5 h-5 text-xs font-bold bg-white text-slate-600">
                                            {showOtherFeatures ? '−' : '+'}
                                        </span>
                                        <span>other features</span>
                                    </button>

                                    {showOtherFeatures && (
                                        <div className="space-y-4 pt-2 border-t border-slate-100 animate-fadeIn">
                                            <div className="flex items-center gap-2 pb-1">
                                                <input 
                                                    type="checkbox" 
                                                    id="select-all" 
                                                    checked={selectedAmenities.length === ALL_AMENITIES.length}
                                                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                                                    className="rounded border-slate-300 accent-[#006AFF] h-4 w-4 cursor-pointer" 
                                                />
                                                <label htmlFor="select-all" className="text-sm font-semibold text-[#006AFF] cursor-pointer select-none">
                                                    Select all amenities
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {ALL_AMENITIES.map((amenity) => {
                                                    const domId = amenity.toLowerCase().replace(/\s+/g, '-');
                                                    const isChecked = selectedAmenities.includes(amenity);
                                                    return (
                                                        <div key={amenity} className="flex items-center gap-2.5 py-1">
                                                            <input 
                                                                type="checkbox" 
                                                                id={domId} 
                                                                checked={isChecked}
                                                                onChange={() => handleAmenityToggle(amenity)}
                                                                className="rounded border-slate-300 accent-[#006AFF] h-4 w-4 cursor-pointer"
                                                            />
                                                            <label 
                                                                htmlFor={domId} 
                                                                className="text-sm text-slate-600 font-medium cursor-pointer hover:text-slate-800 transition-colors select-none"
                                                            >
                                                                {amenity}
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Form Control Actions */}
                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setActiveFilters({ search: "", status: undefined, property_type: undefined, bedroom: undefined });
                                            setBathroomValue("");
                                            setMinPrice("");
                                            setMaxPrice("");
                                            setIsRadiusActive(false);
                                            setRadiusValue(0);
                                            setSelectedAmenities([]);
                                        }}
                                        className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-[#006AFF] hover:bg-[#0057D3] text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm shadow-blue-100"
                                    >
                                        Apply Filters
                                    </button>
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