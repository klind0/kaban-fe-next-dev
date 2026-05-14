"use client"
import { Button } from "@/components/ui/button";
import CustomSelect from "@/components/universal/custom-select";
import CustomTab from "@/components/universal/custom-tab";
import SearchInput from "@/components/universal/search-input";
import { useQueryParams } from "@/hooks/useQueryParams";
import { bedroomOptions, maxPriceOptions, propertyStatusOptions, propertyTypeGroupedOptions } from "@/lib/selectOptions";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function HeroSection() {
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = React.useState<string>(searchParams.get('tab') || 'for-rent')

    const { handleQueryParamsChange, filters } = useQueryParams()

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        handleQueryParamsChange('tab', value)
    }

    return (
        <section className='min-h-screen flex items-center justify-center bg-[#00000051] mt-18'>
            <div className='container mx-auto px-4 md:px-20 space-y-8 md:space-y-16'>
                <div>
                    <p className='text-white text-center h2'>Discover your customized fit with ease</p>
                    <h1 className='text-white text-center'>Smartest way to scout real estate</h1>
                </div>
                <div className="bg-white p-4 rounded-3xl sm:p-8 xl:p-16">
                    <CustomTab
                        items={propertyStatusOptions}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                    <div className="w-full flex flex-col mt-8 lg:flex-row gap-4">
                        <SearchInput
                            onChange={(event) => handleQueryParamsChange('search', event.target.value)}
                        />
                        <CustomSelect
                            placeholder="Bedroom"
                            options={bedroomOptions}
                            value={filters.bedrooms?.toString()}
                            onChange={(val) => handleQueryParamsChange('bedrooms', val)}
                        />
                        <CustomSelect
                            placeholder="Property Type"
                            groups={propertyTypeGroupedOptions}
                            value={filters.category}
                            onChange={(val) => handleQueryParamsChange('category', val)}
                        />
                        <CustomSelect
                            placeholder="Max Price"
                            options={maxPriceOptions}
                            value={filters.priceMax?.toString()}
                            onChange={(val) => handleQueryParamsChange('priceMax', val)}
                        />
                        <Button className="md:min-w-40" size={'lg'}>Search</Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
