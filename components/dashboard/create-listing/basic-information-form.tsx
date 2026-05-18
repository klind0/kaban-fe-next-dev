import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { IListing } from "@/types/listingTypes";
import { Controller, useForm, useWatch } from "react-hook-form";
import FormCard from "./form-card";
import { bedroomOptions, featureOptions, priceSuffixOptions, propertyCategoryOptions, propertyStatusOptions, propertyTypeByCategory } from "@/lib/selectOptions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BasicListingData } from "@/network/listings";
import React from "react";

type Props = {
    onNext: (data: BasicListingData) => void;
    externalErrors?: any; // Centralized validation errors injected from the parent screen
}

export type BasicFormHandle = {
    getValues: () => BasicListingData;
};

const formatNumberWithCommas = (value: string | number) => {
    if (!value) return "";
    const cleanValue = value.toString().replace(/\D/g, "");
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseCommasToNumber = (value: string) => {
    const cleanValue = value.replace(/,/g, "");
    return cleanValue ? Number(cleanValue) : 0;
};

const BasicInformationForm = React.forwardRef<BasicFormHandle, Props>(function BasicInformationForm({ onNext, externalErrors }, ref) {
    const { handleSubmit, control, formState: { errors }, setValue, getValues } = useForm<IListing>({
        defaultValues: {
            title: '',
            status: 'rent',
            property_category: '',
            property_type: '',
            description: '',
            price: {
                amount: 0,
                per: ''
            },
            details: {
                bedroom: 0,
                bathroom: 0,
                toilet: 0,
                living_room: 0,
                land_area: '',
                parking_space: 0,
                furnished: false,
                serviced: false,
                newly_built: false,
                total_floors: 0,
                features: []
            },
        },
        mode: 'onChange'
    });

    const onSubmit = (data: IListing) => {
        onNext({
            title: data.title,
            status: data.status,
            property_category: data.property_category,
            property_type: data.property_type,
            description: data.description,
            price: data.price,
            details: data.details,
        });
    };

    React.useImperativeHandle(ref, () => ({
        getValues: () => {
            const data = getValues();
            return {
                title: data.title,
                status: data.status,
                property_category: data.property_category,
                property_type: data.property_type,
                description: data.description,
                price: data.price,
                details: data.details,
            };
        },
    }));

    const selectedCategory = useWatch({ control, name: 'property_category' });
    const propertyTypeOptions = propertyTypeByCategory[selectedCategory] ?? [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 md:space-y-7.5 mt-8'>
            
            {/* Basic Information Card */}
            <FormCard 
                title={
                    <div className="flex items-center justify-between w-full">
                        <span>Basic Information</span>
                        {(externalErrors?.title || externalErrors?.status || externalErrors?.property_category || externalErrors?.property_type) && (
                            <span className="text-[#B02817] text-xs sm:text-sm font-normal whitespace-nowrap">
                                This section has missing required fields
                            </span>
                        )}
                    </div>
                }
            >
                <div className='space-y-6'>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <FormControl
                                as='input'
                                labelText='Title'
                                placeholder='Enter title'
                                type='text'
                                {...field}
                                error={getErrorMessage(externalErrors?.title || errors.title)}
                            />
                        )}
                    />
                    <div className="w-full flex flex-col md:flex-row gap-6">
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Status'
                                    options={propertyStatusOptions}
                                    placeholder='For sale, for rent'
                                    containerClass="w-full"
                                    {...field}
                                    error={getErrorMessage(externalErrors?.status || errors.status)}
                                />
                            )}
                        />
                        <Controller
                            name="property_category"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Category'
                                    options={propertyCategoryOptions}
                                    placeholder='Residential, Commercial, Industrial'
                                    containerClass="w-full"
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        setValue('property_type', '');
                                    }}
                                    error={getErrorMessage(externalErrors?.property_category || errors.property_category)}
                                />
                            )}
                        />
                        <Controller
                            name="property_type"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Property Type'
                                    options={propertyTypeOptions}
                                    placeholder={selectedCategory ? 'Select property type' : 'Select a category first'}
                                    containerClass="w-full"
                                    {...field}
                                    error={getErrorMessage(externalErrors?.property_type || errors.property_type)}
                                />
                            )}
                        />
                    </div>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <FormControl
                                as='textarea'
                                labelText='Description'
                                placeholder='Brief description of the property'
                                containerClass="w-full"
                                {...field}
                                error={getErrorMessage(externalErrors?.description || errors.description)}
                            />
                        )}
                    />
                </div>
            </FormCard>

            {/* Price Card */}
            <FormCard 
                title={
                    <div className="flex items-center justify-between w-full">
                        <span>Price</span>
                        {externalErrors?.price?.amount && (
                            <span className="text-[#B02817] text-xs sm:text-sm font-normal whitespace-nowrap">
                                This section has missing required fields
                            </span>
                        )}
                    </div>
                }
            >
                <div className="w-full flex flex-col md:flex-row gap-6">
                    <Controller
                        name="price.amount"
                        control={control}
                        render={({ field: { onChange, value, ...restField } }) => (
                            <FormControl
                                as='input'
                                labelText='Sale/Rent Price (₦)'
                                placeholder='0'
                                type="text"
                                inputMode="numeric"
                                value={formatNumberWithCommas(value)}
                                min={0}
                                containerClass="w-full"
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    const numericValue = parseCommasToNumber(rawValue);
                                    onChange(numericValue);
                                }}
                                {...restField}
                                error={getErrorMessage(externalErrors?.price?.amount || errors.price?.amount)}
                            />
                        )}
                    />
                    <Controller
                        name="price.per"
                        control={control}
                        render={({ field }) => (
                            <FormControl
                                as='select'
                                labelText='Price Suffix (/)'
                                options={priceSuffixOptions}
                                placeholder='Per annum, per month, etc'
                                containerClass="w-full"
                                {...field}
                                error={getErrorMessage(externalErrors?.price?.per || errors.price?.per)}
                            />
                        )}
                    />
                </div>
            </FormCard>

            {/* Details Card */}
            <FormCard title="Details">
                <div className='space-y-6'>
                    <div className="w-full flex flex-col md:flex-row gap-6">
                        <Controller
                            name="details.bedroom"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Bedrooms'
                                    options={bedroomOptions}
                                    placeholder='Select number of bedrooms'
                                    containerClass="w-full"
                                    {...field}
                                    value={String(field.value ?? '')}
                                    error={getErrorMessage(externalErrors?.details?.bedroom || errors.details?.bedroom)}
                                />
                            )}
                        />
                        <Controller
                            name="details.bathroom"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Bathrooms'
                                    options={bedroomOptions}
                                    placeholder='Select number of bathrooms'
                                    containerClass="w-full"
                                    {...field}
                                    value={String(field.value ?? '')}
                                    error={getErrorMessage(externalErrors?.details?.bathroom || errors.details?.bathroom)}
                                />
                            )}
                        />
                        <Controller
                            name="details.parking_space"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Parking Lot'
                                    options={bedroomOptions}
                                    placeholder='Select number of parking lots'
                                    containerClass="w-full"
                                    {...field}
                                    value={String(field.value ?? '')}
                                    error={getErrorMessage(externalErrors?.details?.parking_space || errors.details?.parking_space)}
                                />
                            )}
                        />
                    </div>
                    <div className="w-full flex flex-col md:flex-row gap-6">
                        <Controller
                            name="details.land_area"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='input'
                                    labelText='Land Area'
                                    placeholder='Your land area in sqm, acres, etc'
                                    containerClass="w-full"
                                    {...field}
                                    error={getErrorMessage(externalErrors?.details?.land_area || errors.details?.land_area)}
                                />
                            )}
                        />
                        <Controller
                            name="details.living_room"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Living Room'
                                    options={bedroomOptions}
                                    placeholder='Select number of living rooms'
                                    containerClass="w-full"
                                    {...field}
                                    value={String(field.value ?? '')}
                                    onChange={(val) => field.onChange(Number(val) || 0)}
                                    error={getErrorMessage(externalErrors?.details?.living_room || errors.details?.living_room)}
                                />
                            )}
                        />
                    </div>
                    <Controller
                        name="details.features"
                        control={control}
                        render={({ field }) => {
                            const selected: string[] = field.value ?? [];
                            const allSelected = featureOptions.every((f) => selected.includes(f.value));

                            const toggle = (value: string) => {
                                const next = selected.includes(value)
                                    ? selected.filter((v) => v !== value)
                                    : [...selected, value];
                                field.onChange(next);
                            };

                            const toggleAll = () => {
                                field.onChange(allSelected ? [] : featureOptions.map((f) => f.value));
                            };

                            return (
                                <div className="space-y-4">
                                    <h3 className="text-black text-2xl font-semibold">Features</h3>
                                    <label className="flex items-center gap-2 cursor-pointer w-fit">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={toggleAll}
                                        />
                                        <span className="text-sm font-medium">Select all</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                                        {featureOptions.map((feature) => (
                                            <label key={feature.value} className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={selected.includes(feature.value)}
                                                    onCheckedChange={() => toggle(feature.value)}
                                                />
                                                <span className="text-sm">{feature.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>
            </FormCard>

            <div className="flex justify-end gap-3">
                <Button variant={'outline'} type="button" className="md:min-w-30">Cancel</Button>
                <Button type="submit" className="md:min-w-30">Next</Button>
            </div>
        </form>
    )
});

export default BasicInformationForm;