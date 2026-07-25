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
        <section className='min-h-screen flex items-center justify-center bg-[#00000051] mt-18'>
            <div className='container mx-auto px-4 md:px-20 space-y-8 md:space-y-16'>
                <div>
                    <p className='text-white text-center h2'>Discover your customized fit with ease</p>
                    <h1 className='text-white text-center'>Smartest way to scout real estate</h1>
                </div>
                <div className="bg-card p-4 rounded-3xl sm:p-8 xl:p-16 shadow-lg border border-border">
                    <CustomTab
                        items={propertyStatusOptions}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                    <div className="w-full flex flex-col mt-8 lg:flex-row gap-4 items-start">
                        <div className="w-full flex-1">
                            {/* Google Places Location Search Autocomplete */}
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

                        <CustomSelect
                            placeholder="Bedroom"
                            options={bedroomOptions}
                            value={filters.bedroom?.toString()}
                            onChange={(val) => handleQueryParamsChange('bedroom', val)}
                        />

                        <CustomSelect
                            placeholder="Property Type"
                            groups={propertyTypeGroupedOptions}
                            value={filters.property_type}
                            onChange={(val) => handleQueryParamsChange('property_type', val)}
                        />

                        <CustomSelect
                            placeholder="Max Price"
                            options={maxPriceOptions}
                            value={filters.priceMax?.toString()}
                            onChange={(val) => handleQueryParamsChange('priceMax', val)}
                        />

                        <Button 
                            onClick={handleSearch} 
                            className="w-full lg:w-auto md:min-w-40 bg-primary hover:opacity-90 transition-all text-primary-foreground font-semibold h-11" 
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