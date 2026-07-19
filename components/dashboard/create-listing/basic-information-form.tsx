"use client";

import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { IListing } from "@/types/listingTypes";
import { Controller, useForm, useWatch } from "react-hook-form";
import FormCard from "./form-card";
import { 
    bedroomOptions, 
    featureOptions, 
    priceSuffixOptions, 
    propertyCategoryOptions, 
    propertyStatusOptions, 
    propertyTypeByCategory 
} from "@/lib/selectOptions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { BasicListingData } from "@/network/listings";
import React from "react";

type Props = {
    onFormSubmit: (data: BasicListingData) => void; // Aligned naming with wizard state engine callbacks
    initialData?: Partial<IListing> | null;        // Injected polymorphic hydration state layer
    onBack?: () => void;                           // Navigation safety escape fallback line
    isPending?: boolean;                           // Layout locking state flag
    externalErrors?: any;                          // Centralized validation errors injected from parent
};

export type BasicFormHandle = {
    getValues: () => BasicListingData;
};

const formatNumberWithCommas = (value: string | number) => {
    if (value === undefined || value === null || value === "") return "";
    const cleanValue = value.toString().replace(/\D/g, "");
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseCommasToNumber = (value: string) => {
    const cleanValue = value.replace(/,/g, "");
    return cleanValue ? Number(cleanValue) : 0;
};

const BasicInformationForm = React.forwardRef<BasicFormHandle, Props>(function BasicInformationForm(
    { onFormSubmit, initialData, onBack, isPending, externalErrors }, 
    ref
) {

    // DOM references for custom components that bypass browser auto-focus mechanisms
    const statusRef = React.useRef<HTMLDivElement>(null);
    const categoryRef = React.useRef<HTMLDivElement>(null);
    const typeRef = React.useRef<HTMLDivElement>(null);
    
    const { 
        handleSubmit, 
        control, 
        formState: { errors }, 
        setValue, 
        getValues 
    } = useForm<IListing>({
        // Hydrate defaults gracefully from existing database entry values if in edit mode
        defaultValues: {
            title: initialData?.title || '',
            status: initialData?.status || 'rent',
            property_category: initialData?.property_category || '',
            property_type: initialData?.property_type || '',
            description: initialData?.description || '',
            price: {
                amount: initialData?.price?.amount ?? 0,
                per: initialData?.price?.per || ''
            },
            details: {
                bedroom: initialData?.details?.bedroom ?? 0,
                bathroom: initialData?.details?.bathroom ?? 0,
                living_room: initialData?.details?.living_room ?? 0,
                land_area: initialData?.details?.land_area || '',
                parking_space: initialData?.details?.parking_space ?? 0,
                furnished: initialData?.details?.furnished ?? false,
                serviced: initialData?.details?.serviced ?? false,
                newly_built: initialData?.details?.newly_built ?? false,
                total_floors: initialData?.details?.total_floors ?? 0,
                features: initialData?.details?.features || []
            },
        },
        mode: 'onChange'
    });

    const onSubmit = (data: IListing) => {
        onFormSubmit({
            title: data.title,
            status: data.status,
            property_category: data.property_category,
            property_type: data.property_type,
            description: data.description,
            price: data.price,
            details: data.details,
        });
    };

    // Scans React Hook Form errors arrays sequentially when standard onSubmit is rejected
    const onFormError = (formErrors: typeof errors) => {
        if (formErrors.status) {
            statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (formErrors.property_category) {
            categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (formErrors.property_type) {
            typeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
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
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className='space-y-4 md:space-y-7.5 mt-8'>
            
            {/* Basic Information Card */}
            <FormCard 
                title={
                    <div className="flex items-center justify-between w-full">
                        <span>Basic Information</span>
                        {(externalErrors?.title || externalErrors?.status || externalErrors?.property_category || externalErrors?.property_type || errors.title || errors.status || errors.property_category || errors.property_type) && (
                            <span className="text-[#B02817] text-xs sm:text-sm font-normal whitespace-nowrap bg-red-50/60 px-2 py-0.5 rounded">
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
                        rules={{ required: "Property title is required" }}
                        render={({ field }) => (
                            <FormControl
                                as='input'
                                labelText='Title *'
                                placeholder='Enter title'
                                type='text'
                                {...field}
                                disabled={isPending}
                                error={getErrorMessage(externalErrors?.title || errors.title)}
                            />
                        )}
                    />
                    
                    <div className="w-full flex flex-col md:flex-row gap-6">
                        {/* Status Selection */}
                        <div ref={statusRef} className="w-full scroll-mt-24">
                            <Controller
                                name="status"
                                control={control}
                                rules={{ required: "Property status is required" }}
                                render={({ field }) => (
                                    <FormControl
                                        as='select'
                                        labelText='Status *'
                                        options={propertyStatusOptions}
                                        placeholder='Sale, Rent'
                                        containerClass="w-full"
                                        {...field}
                                        disabled={isPending}
                                        error={getErrorMessage(externalErrors?.status || errors.status)}
                                    />
                                )}
                            />
                        </div>

                        {/* Category Selection */}
                        <div ref={categoryRef} className="w-full scroll-mt-24">
                            <Controller
                                name="property_category"
                                control={control}
                                rules={{ required: "Property category is required" }}
                                render={({ field }) => (
                                    <FormControl
                                        as='select'
                                        labelText='Category *'
                                        options={propertyCategoryOptions}
                                        placeholder='Select a property category'
                                        containerClass="w-full"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setValue('property_type', '', { shouldValidate: true });
                                        }}
                                        disabled={isPending}
                                        error={getErrorMessage(externalErrors?.property_category || errors.property_category)}
                                    />
                                )}
                            />
                        </div>

                        {/* Property Type Selection */}
                        <div ref={typeRef} className="w-full scroll-mt-24">
                            <Controller
                                name="property_type"
                                control={control}
                                rules={{ required: "Property type is required" }}
                                render={({ field }) => (
                                    <FormControl
                                        as='select'
                                        labelText='Property Type *'
                                        options={propertyTypeOptions}
                                        placeholder={selectedCategory ? 'Select property type' : 'Select a category first'}
                                        containerClass="w-full"
                                        {...field}
                                        disabled={!selectedCategory || isPending}
                                        error={getErrorMessage(externalErrors?.property_type || errors.property_type)}
                                    />
                                )}
                            />
                        </div>
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
                                disabled={isPending}
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
                        {(externalErrors?.price?.amount || errors.price?.amount) && (
                            <span className="text-[#B02817] text-xs sm:text-sm font-normal whitespace-nowrap bg-red-50/60 px-2 py-0.5 rounded">
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
                        rules={{ 
                            required: "Price amount is required",
                            min: { value: 1, message: "Price must be greater than 0" }
                        }}
                        render={({ field: { onChange, value, ...restField } }) => (
                            <FormControl
                                as='input'
                                labelText='Sale/Rent Price (₦) *'
                                placeholder='0'
                                type="text"
                                inputMode="numeric"
                                value={formatNumberWithCommas(value)}
                                containerClass="w-full"
                                onChange={(e) => {
                                    const rawValue = e.target.value;
                                    const numericValue = parseCommasToNumber(rawValue);
                                    onChange(numericValue);
                                }}
                                disabled={isPending}
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
                                disabled={isPending}
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
                                    onChange={(val) => field.onChange(Number(val) || 0)}
                                    disabled={isPending}
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
                                    onChange={(val) => field.onChange(Number(val) || 0)}
                                    disabled={isPending}
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
                                    onChange={(val) => field.onChange(Number(val) || 0)}
                                    disabled={isPending}
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
                                    disabled={isPending}
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
                                    disabled={isPending}
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
                                            disabled={isPending}
                                        />
                                        <span className="text-sm font-medium">Select all</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
                                        {featureOptions.map((feature) => (
                                            <label key={feature.value} className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={selected.includes(feature.value)}
                                                    onCheckedChange={() => toggle(feature.value)}
                                                    disabled={isPending}
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
                <Button 
                    variant={'outline'} 
                    type="button" 
                    className="md:min-w-30"
                    onClick={onBack}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    className="md:min-w-30"
                    disabled={isPending}
                >
                    Next
                </Button>
            </div>
        </form>
    );
});

export default BasicInformationForm;