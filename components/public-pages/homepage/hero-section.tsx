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

    // Default tab state (rent or sale)
    const [activeTab, setActiveTab] = React.useState<string>(filters.category || 'rent');

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        handleQueryParamsChange('category', value as 'rent' | 'sale');
    };

    // 🚀 When Search is clicked, build query string and navigate to /search
    const handleSearch = () => {
        const params = new URLSearchParams();

        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
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
                    <div className="w-full flex flex-col mt-8 lg:flex-row gap-4">
                        <SearchInput
                            onChange={(event) => handleQueryParamsChange('location', event.target.value)}
                        />
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
                            className="md:min-w-40 bg-[#006AFF] hover:bg-[#0057D3] transition-colors text-white" 
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