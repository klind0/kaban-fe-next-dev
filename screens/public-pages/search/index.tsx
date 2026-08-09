'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, Rows, MapPin, Check } from "lucide-react";

// Core UI Components
import Container from '@/components/universal/Container';
import ListingCard from '@/components/universal/listing-card';
import MobileMapControl from './components/MobileMapControl';
import { QUERY_KEY } from '@/enum/queryKeys';
import { gqlRequest } from '@/network/graphql-client';
import { PUBLIC_LISTINGS_QUERY } from '@/network/gql/listings.ql'; 
import { IListingResponse, PropertyCategory, PropertyType, Status } from '@/types/listingTypes';
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

// Sort Options Matrix
const SORT_OPTIONS = [
    { label: "Default order", value: "default" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Oldest listings", value: "oldest" },
];

/**
 * Safe parser utility for numeric price comparisons
 */
const parsePrice = (value: unknown): number => {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    if (typeof value === 'object' && value !== null && 'amount' in value) {
        return parsePrice((value as any).amount);
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

// Custom Selection Dropdown Component with Primary Theme Integration
function CustomSelect({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder = "Select...",
    icon: Icon
}: { 
    label?: string; 
    value: string; 
    options: { label: string; value: string; isHeader?: boolean }[]; 
    onChange: (val: string) => void;
    placeholder?: string;
    icon?: React.ElementType;
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
        <div ref={containerRef} className="relative space-y-1 w-full min-w-[160px]">
            {label && (
                <span className="text-xs font-bold text-gray-50 uppercase tracking-wider">
                    {label}
                </span>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm bg-card transition-all text-left font-medium ${
                    isOpen ? 'border-primary ring-1 ring-primary/20 text-foreground' : 'border-border text-foreground'
                }`}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="w-4 h-4 text-gray-25 shrink-0" />}
                    <span className="truncate">
                        {selectedOption && selectedOption.value !== "" ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-25 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-30 right-0 mt-1 min-w-full w-max max-h-60 overflow-y-auto bg-card border border-border rounded-lg shadow-lg py-1 animate-fadeIn">
                    {options.map((opt, i) => {
                        if (opt.isHeader) {
                            return (
                                <div key={i} className="px-3 py-1.5 text-xs font-bold text-gray-25 bg-neutral-100 uppercase tracking-wider">
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
                                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-4 hover:bg-neutral-100 transition-colors ${
                                    value === opt.value ? 'text-primary font-semibold bg-primary/10' : 'text-gray-50'
                                }`}
                            >
                                <span className="whitespace-nowrap">{opt.label}</span>
                                {value === opt.value && <Check className="w-4 h-4 text-primary shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function SearchResultsPage({ initialSearchTerm }: ResultsProps) {
    const searchParams = useSearchParams();

    const [position, setPosition] = useState<'portrait' | 'landscape'>('portrait');
    const [stackOrder, setStackOrder] = useState<'listings' | 'map'>('listings');
    const [map, setMap] = useState(false);

    // Sort State
    const [sortOrder, setSortOrder] = useState<string>('default');
    
    // UI Panel Control States
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isRadiusActive, setIsRadiusActive] = useState(false);
    const [radiusValue, setRadiusValue] = useState(0);
    const [showOtherFeatures, setShowOtherFeatures] = useState(false);

    // Active Amenities Checklist State Array
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    // Filter Variables State Tracker
    const [activeFilters, setActiveFilters] = useState<Partial<IQueryParamsType>>({
        search: initialSearchTerm || "",
        status: undefined,
        category: undefined,
        property_type: undefined,
        bedroom: undefined,
    });

    const [bathroomValue, setBathroomValue] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // 🚀 Sync URL parameters (Status, Location, Bedroom, Property Type, PriceMax) on page load/navigation
    useEffect(() => {
        const rawLocation = searchParams.get('location') || searchParams.get('search') || initialSearchTerm || "";
        const rawStatus = searchParams.get('status');
        const rawCategory = searchParams.get('category');
        const rawBedroom = searchParams.get('bedroom') || searchParams.get('bedrooms');
        const rawPropertyType = searchParams.get('property_type');
        const rawPriceMax = searchParams.get('priceMax') || searchParams.get('max_price');

        setActiveFilters({
            search: rawLocation,
            status: rawStatus ? (rawStatus.toLowerCase() as Status) : undefined,
            category: rawCategory ? (rawCategory.toLowerCase() as PropertyCategory) : undefined,
            property_type: rawPropertyType ? (rawPropertyType as PropertyType) : undefined,
            bedroom: rawBedroom ? Number(rawBedroom) : undefined,
        });

        if (rawPriceMax) {
            setMaxPrice(rawPriceMax);
        }
    }, [searchParams, initialSearchTerm]);

    // Query Execution Pipeline
    const { data: searchData, isLoading } = useQuery({
        queryKey: [
            QUERY_KEY.PUBLIC_LISTINGS,
            activeFilters,
            minPrice,
            maxPrice,
            bathroomValue,
            selectedAmenities,
            isRadiusActive ? radiusValue : null
        ],
        queryFn: () =>
            gqlRequest<{ publicListings: IListingResponse }>(PUBLIC_LISTINGS_QUERY, {
                filter: {
                    ...(activeFilters.search && { search: activeFilters.search }),
                    ...(activeFilters.status && { status: activeFilters.status }),
                    ...(activeFilters.category && { category: activeFilters.category }),
                    ...(activeFilters.property_type && { property_type: activeFilters.property_type }),
                    ...(activeFilters.bedroom && { "details.bedroom": Number(activeFilters.bedroom) }),
                    ...(bathroomValue && { "details.bathroom": Number(bathroomValue) }),
                    ...(minPrice && { min_price: Number(minPrice) }),
                    ...(maxPrice && { max_price: Number(maxPrice) }),
                    ...(selectedAmenities.length > 0 && { amenities: selectedAmenities }),
                    ...(isRadiusActive && radiusValue > 0 && { radius: radiusValue }),
                },
                limit: 50,
            }),
    });

    const rawListings = searchData?.publicListings?.data ?? [];

    // 🎲 Stable random shuffle created once whenever rawListings update
    const randomizedRawListings = useMemo(() => {
        if (!Array.isArray(rawListings)) return [];
        const arr = [...rawListings];
        // Fisher-Yates Shuffle algorithm
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [rawListings]);

    // 🏆 Client-side sorting logic: Featured listings ALWAYS prioritized first
    const listings = useMemo(() => {
        if (!Array.isArray(rawListings) || rawListings.length === 0) return [];

        const baseList = sortOrder === 'default' ? randomizedRawListings : [...rawListings];

        // Separate featured and non-featured listings
        const featuredList = baseList.filter((item) => item.isFeatured);
        const nonFeaturedList = baseList.filter((item) => !item.isFeatured);

        // Sorting function according to chosen option
        const sortFn = (a: any, b: any) => {
            if (sortOrder === 'price_asc') {
                return parsePrice(a.price) - parsePrice(b.price);
            }
            if (sortOrder === 'price_desc') {
                return parsePrice(b.price) - parsePrice(a.price);
            }
            if (sortOrder === 'oldest') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            return 0; // 'default' order maintains randomized structure
        };

        if (sortOrder !== 'default') {
            featuredList.sort(sortFn);
            nonFeaturedList.sort(sortFn);
        }

        // Always stack featured listings first
        return [...featuredList, ...nonFeaturedList];
    }, [rawListings, randomizedRawListings, sortOrder]);

    const totalResults = listings.length;
    const { mediasize } = useResponsiveNav({});

    useEffect(() => {
        mediasize === 'mobile'
            ? stackOrder === 'map' ? setMap(false) : setMap(true)
            : setMap(false);
    }, [mediasize, stackOrder]);

    const toggleMap = () => setMap(!map);

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
    const order = position === 'portrait' ? 'grid-cols-[repeat(auto-fit,minmax(22rem,1fr))]' : 'grid-cols-[repeat(auto-fit,minmax(30rem,1fr))]';
    const mapPage = stackOrder === 'map' && mediasize === 'mobile' ? 'fixed top-[11rem] left-0 w-full' : '';
    const renderMap = !map ? 'w-[60%]' : 'w-0 opacity-0';

    return (
        <Container element="section" className={`flex w-full min-h-screen bg-background pb-12 ${!map ? 'md:gap-6 xl:pe-16' : 'md:gap-0 md:px-16'}`}>
            {/* MAP SECTION COMMENTED OUT */}
            {/*
            <div className={`transition-all delay-100 ${renderMap} ${mapPage}`}>
                <div className={'h-[95vh] top-4 sticky'}>
                    <Image src={'https://images.unsplash.com/photo-1524661135339-9140b00787e3?auto=format&fit=crop&w=800&q=80'} width={800} height={1000} className="w-full rounded-xl h-full object-cover object-top border border-border" alt="Search map view" priority />
                </div>
            </div>
            */}

            {/* MOBILE MAP CONTROL COMMENTED OUT */}
            {/*
            <MobileMapControl setMap={setMap} stackOrder={stackOrder} setStackOrder={setStackOrder} />
            */}

            <div className="w-full space-y-5">
                <div className={`${stackOrder === 'map' && mediasize === 'mobile' && 'p-[3%] bg-neutral-100 fixed inset-x-0 top-0 max-h-[11.8rem] pt-20 w-screen z-10'}`}>
                    <div className="text-sm text-gray-25 mb-1 font-medium">
                        <Link href={'/'} className="text-primary hover:underline">Home</Link>
                        <span> / Search</span>
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">Available Properties</h3>
                    
                    {/* Floating Controls Row */}
                    <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3.5 shadow-sm w-full mb-4">
                        <span className="text-sm font-semibold text-gray-50">
                            {totalResults} {totalResults === 1 ? 'Result' : 'Results'} Found
                        </span>

                        <div className="flex items-center gap-3">
                            <CustomSelect 
                                value={sortOrder}
                                options={SORT_OPTIONS}
                                onChange={(val) => setSortOrder(val)}
                                icon={SlidersHorizontal}
                            />

                            {/* VIEW TOGGLE DIV COMMENTED OUT */}
                            {/*
                            <div className="hidden md:flex items-center border border-border rounded-lg p-1 bg-neutral-100">
                                <button 
                                    type="button"
                                    onClick={() => setPosition('landscape')}
                                    className={`p-1.5 rounded-md transition-colors ${position === 'landscape' ? 'bg-card text-primary shadow-sm' : 'text-gray-25 hover:text-foreground'}`}
                                    title="Landscape View"
                                >
                                    <Rows className="w-4 h-4" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setPosition('portrait')}
                                    className={`p-1.5 rounded-md transition-colors ${position === 'portrait' ? 'bg-card text-primary shadow-sm' : 'text-gray-25 hover:text-foreground'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={toggleMap}
                                    className={`p-1.5 rounded-md transition-colors ml-1 border-l border-border pl-2 ${map ? 'text-primary font-semibold' : 'text-gray-25 hover:text-foreground'}`}
                                    title="Toggle Map"
                                >
                                    <MapPin className="w-4 h-4" />
                                </button>
                            </div>
                            */}
                        </div>
                    </div>
                    
                    {/* ACCORDION FILTER DASHBOARD COMMENTED OUT */}
                    {/*
                    <div className={`w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-6 ${stackOrder === 'map' && mediasize === 'mobile' ? 'opacity-0 invisible max-h-0' : ''}`}>
                        <button 
                            type="button"
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className="w-full flex items-center justify-between p-4 bg-card hover:bg-neutral-100/50 transition-colors text-left font-semibold text-sm text-foreground"
                        >
                            <span>Advanced Filter Options</span>
                            {isAdvancedOpen ? <ChevronUp className="w-4 h-4 text-gray-50" /> : <ChevronDown className="w-4 h-4 text-gray-50" />}
                        </button>

                        {isAdvancedOpen && (
                            <div className="p-5 border-t border-border bg-card space-y-6 transition-all duration-200">
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setIsRadiusActive(!isRadiusActive)}
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                isRadiusActive ? 'border-primary bg-primary' : 'border-border bg-card'
                                            }`}
                                        >
                                            {isRadiusActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                                        </button>
                                        <label 
                                            onClick={() => setIsRadiusActive(!isRadiusActive)}
                                            className="text-sm font-semibold text-foreground cursor-pointer select-none"
                                        >
                                            Radius Filter
                                        </label>
                                        <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
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
                                            isRadiusActive ? 'accent-primary bg-neutral-200' : 'accent-neutral-300 bg-neutral-100 opacity-50 pointer-events-none'
                                        }`} 
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    <div className="col-span-2 md:col-span-2">
                                        <input 
                                            type="text" 
                                            value={activeFilters.search || ''}
                                            onChange={(e) => setActiveFilters(p => ({ ...p, search: e.target.value }))}
                                            placeholder="Location..." 
                                            className="w-full border border-border rounded-lg p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-card font-medium placeholder:text-gray-25" 
                                        />
                                    </div>
                                    
                                    <div className="col-span-1 md:col-span-1">
                                        <CustomSelect 
                                            value={activeFilters.status || ''}
                                            placeholder="Status"
                                            options={[
                                                { label: "All Statuses", value: "" },
                                                { label: "Rent", value: "rent" },
                                                { label: "Sale", value: "sale" }
                                            ]}
                                            onChange={(val) => setActiveFilters(p => ({ ...p, status: (val as Status) || undefined }))}
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-1">
                                        <CustomSelect 
                                            value={activeFilters.property_type || ''}
                                            placeholder="Property Type"
                                            options={[
                                                { label: "Select type...", value: "" },
                                                { label: "Residential", value: "RESIDENTIAL_HDR", isHeader: true },
                                                { label: "Self Contain", value: "Self Contain" },
                                                { label: "Apartment", value: "Apartment" },
                                                { label: "Detached House", value: "Detached House" },
                                                { label: "Terrace House", value: "Terrace house" },
                                                { label: "Semi-detached House", value: "Semi-detached House" },
                                                { label: "Commercial", value: "COMMERCIAL_HDR", isHeader: true },
                                                { label: "Shop", value: "Shop" },
                                                { label: "Office", value: "Office" },
                                                { label: "Hotel", value: "Hotel" },
                                            ]}
                                            onChange={(val) => setActiveFilters(p => ({ ...p, property_type: (val as PropertyType) || undefined }))}
                                        />
                                    </div>

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

                                    <div className="col-span-1 md:col-span-1">
                                        <input 
                                            type="number" 
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="Min. price" 
                                            className="w-full border border-border rounded-lg p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-card font-medium placeholder:text-gray-25" 
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-1">
                                        <input 
                                            type="number" 
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="Max. price" 
                                            className="w-full border border-border rounded-lg p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-card font-medium placeholder:text-gray-25" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowOtherFeatures(!showOtherFeatures)}
                                        className="flex items-center gap-2 text-gray-50 font-medium text-sm select-none hover:text-primary transition-colors"
                                    >
                                        <span className="flex items-center justify-center border border-border rounded-md w-5 h-5 text-xs font-bold bg-card text-gray-50">
                                            {showOtherFeatures ? '−' : '+'}
                                        </span>
                                        <span>other features</span>
                                    </button>

                                    {showOtherFeatures && (
                                        <div className="space-y-4 pt-2 border-t border-border animate-fadeIn">
                                            <div className="flex items-center gap-2 pb-1">
                                                <input 
                                                    type="checkbox" 
                                                    id="select-all" 
                                                    checked={selectedAmenities.length === ALL_AMENITIES.length}
                                                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                                                    className="rounded border-border accent-primary h-4 w-4 cursor-pointer" 
                                                />
                                                <label htmlFor="select-all" className="text-sm font-semibold text-primary cursor-pointer select-none">
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
                                                                className="rounded border-border accent-primary h-4 w-4 cursor-pointer"
                                                            />
                                                            <label 
                                                                htmlFor={domId} 
                                                                className="text-sm text-gray-50 font-medium cursor-pointer hover:text-foreground transition-colors select-none"
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

                                <div className="pt-4 border-t border-border flex justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setActiveFilters({ search: "", status: undefined, category: undefined, property_type: undefined, bedroom: undefined });
                                            setBathroomValue("");
                                            setMinPrice("");
                                            setMaxPrice("");
                                            setIsRadiusActive(false);
                                            setRadiusValue(0);
                                            setSelectedAmenities([]);
                                        }}
                                        className="px-5 py-2.5 rounded-lg border border-border text-gray-50 font-semibold text-sm hover:bg-neutral-100 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-lg transition-all shadow-sm"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    */}
                </div>

                {isLoading ? (
                    <div className="py-16 text-center text-sm font-semibold text-gray-25 bg-card rounded-xl border border-border shadow-sm">
                        Loading properties matching your search...
                    </div>
                ) : listings.length === 0 ? (
                    <div className="py-16 text-center text-sm font-semibold text-gray-25 bg-card rounded-xl border border-border shadow-sm">
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