"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/universal/custom-select";
import CustomTab from "@/components/universal/custom-tab";
import SearchInput from "@/components/universal/search-input";
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

    // 1. Default tab state to 'rent'
    const [activeTab, setActiveTab] = React.useState<string>(filters.category || 'rent');
    const [locationError, setLocationError] = React.useState<boolean>(false);

    // Sync default 'rent' status on initial load if none exists in URL
    React.useEffect(() => {
        if (!filters.category) {
            handleQueryParamsChange('category', 'rent');
        }
    }, [filters.category, handleQueryParamsChange]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        handleQueryParamsChange('category', value as 'rent' | 'sale');
    };

    const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (locationError && event.target.value.trim()) {
            setLocationError(false);
        }
        handleQueryParamsChange('location', event.target.value);
    };

    // 🚀 Execute search only when compulsory fields pass validation
    const handleSearch = () => {
        // 2. Validate compulsory location field
        if (!filters.location || !filters.location.trim()) {
            setLocationError(true);
            return;
        }

        const params = new URLSearchParams();

        params.set('location', filters.location.trim());
        // Default category to 'rent' if absent
        params.set('category', filters.category || 'rent');
        if (filters.bedroom) params.set('bedroom', filters.bedroom.toString());
        if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
        if (filters.status) params.set('status', filters.status);

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
                <div className="bg-white p-4 rounded-3xl sm:p-8 xl:p-16 shadow-lg border border-slate-100">
                    <CustomTab
                        items={propertyStatusOptions}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                    <div className="w-full flex flex-col mt-8 lg:flex-row gap-4 items-start">
                        <div className="w-full flex-1">
                            <SearchInput
                                value={filters.location || ''}
                                placeholder="Search location..."
                                onChange={handleLocationChange}
                                className={locationError ? "border-red-500 focus:border-red-500" : ""}
                            />
                            {locationError && (
                                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">
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
                            value={filters.status}
                            onChange={(val) => handleQueryParamsChange('status', val)}
                        />
                        <CustomSelect
                            placeholder="Max Price"
                            options={maxPriceOptions}
                            value={filters.priceMax?.toString()}
                            onChange={(val) => handleQueryParamsChange('priceMax', val)}
                        />
                        <Button 
                            onClick={handleSearch} 
                            className="w-full lg:w-auto md:min-w-40 bg-[#006AFF] hover:bg-[#0057D3] transition-colors text-white" 
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