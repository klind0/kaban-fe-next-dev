"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/universal/custom-select";
import CustomTab from "@/components/universal/custom-tab";
import LocationSearchAutocomplete from "@/components/universal/LocationSearchAutocomplete";
import { useQueryParams } from "@/hooks/useQueryParams";
import { 
  bedroomOptions, 
  maxPriceOptions, 
  propertyStatusOptions, 
  propertyTypeGroupedOptions 
} from "@/lib/selectOptions";

export default function HeroSection() {
    const router = useRouter();
    const { filters, handleQueryParamsChange } = useQueryParams();

    const [activeTab, setActiveTab] = React.useState<string>(filters.status || 'rent');
    const [locationError, setLocationError] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!filters.status) {
            handleQueryParamsChange('status', 'rent');
        }
    }, [filters.status, handleQueryParamsChange]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        handleQueryParamsChange('status', value as 'rent' | 'sale');
    };

    const handleLocationChange = (val: string) => {
        if (locationError && val.trim()) {
            setLocationError(false);
        }
        handleQueryParamsChange('location', val);
    };

    const handleSearch = () => {
        if (!filters.location || !filters.location.trim()) {
            setLocationError(true);
            return;
        }

        const params = new URLSearchParams();

        params.set('location', filters.location.trim());
        params.set('status', filters.status || 'rent');
        
        if (filters.category && filters.category !== ('rent' as any) && filters.category !== ('sale' as any)) {
            params.set('category', filters.category);
        } else {
            params.delete('category');
        }

        if (filters.property_type) params.set('property_type', filters.property_type);
        if (filters.bedroom) params.set('bedroom', filters.bedroom.toString());
        if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());

        const queryString = params.toString();
        router.push(`/search${queryString ? `?${queryString}` : ''}`);
    };

    return (
        <section className='min-h-screen flex items-center justify-center bg-foreground/30 mt-18'>
            <div className='container mx-auto px-4 md:px-20 space-y-8 md:space-y-16'>
                <div>
                    <p className='text-white text-center h2'>Discover your customized fit with ease</p>
                    <h1 className='text-white text-center'>Smartest way to find real estate</h1>
                </div>
                <div className="bg-card p-4 rounded-3xl sm:p-8 xl:p-12 shadow-lg border border-border">
                    <CustomTab
                        items={propertyStatusOptions}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                    <div className="w-full flex flex-col mt-8 lg:flex-row gap-3 items-center">
                        {/* Location Autocomplete Search */}
                        <div className="w-full lg:flex-1">
                            <LocationSearchAutocomplete
                                value={filters.location || ''}
                                placeholder="Search location or Property ID..."
                                onChange={handleLocationChange}
                                onSelectLocation={(term) => handleQueryParamsChange('location', term)}
                                error={locationError}
                            />
                            {locationError && (
                                <p className="text-destructive text-xs font-semibold mt-1 ml-1">
                                    Location is required to search.
                                </p>
                            )}
                        </div>

                        {/* Bedroom Dropdown */}
                        <div className="w-full lg:w-32 xl:w-36">
                            <CustomSelect
                                placeholder="Bedroom"
                                options={bedroomOptions}
                                value={filters.bedroom?.toString()}
                                onChange={(val) => handleQueryParamsChange('bedroom', val)}
                            />
                        </div>

                        {/* Property Type Dropdown */}
                        <div className="w-full lg:w-40 xl:w-44">
                            <CustomSelect
                                placeholder="Property Type"
                                groups={propertyTypeGroupedOptions}
                                value={filters.property_type}
                                onChange={(val) => handleQueryParamsChange('property_type', val)}
                            />
                        </div>

                        {/* Max Price Dropdown */}
                        <div className="w-full lg:w-36 xl:w-40">
                            <CustomSelect
                                placeholder="Max Price"
                                options={maxPriceOptions}
                                value={filters.priceMax?.toString()}
                                onChange={(val) => handleQueryParamsChange('priceMax', val)}
                            />
                        </div>

                        {/* Search Button */}
                        <Button 
                            onClick={handleSearch} 
                            className="w-full lg:w-auto lg:px-8 bg-primary hover:opacity-90 transition-all text-primary-foreground font-semibold h-11 shrink-0" 
                            size={'lg'}
                        >
                            Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}