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
}

export type BasicFormHandle = {
    getValues: () => BasicListingData;
};

const BasicInformationForm = React.forwardRef<BasicFormHandle, Props>(function BasicInformationForm({ onNext }, ref) {
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
        mode: 'all'
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
            <FormCard title="Basic Information">
                <div className='space-y-6'>
                    <Controller
                        name="title"
                        control={control}
                        rules={{
                            required: 'Title is required',
                            minLength: {
                                value: 5,
                                message: 'Title must be at least 5 characters'
                            }
                        }}
                        render={({ field }) => (
                            <FormControl
                                as='input'
                                labelText='Title'
                                placeholder='Enter title'
                                type='text'
                                required
                                {...field}
                                error={getErrorMessage(errors.title)}
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
                                    error={getErrorMessage(errors.status)}
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
                                    error={getErrorMessage(errors.property_category)}
                                />
                            )}
                        />
                        <Controller
                            name="property_type"
                            control={control}
                            rules={{ required: 'Property type is required' }}
                            render={({ field }) => (
                                <FormControl
                                    as='select'
                                    labelText='Property Type'
                                    options={propertyTypeOptions}
                                    placeholder={selectedCategory ? 'Select property type' : 'Select a category first'}
                                    containerClass="w-full"
                                    required
                                    {...field}
                                    error={getErrorMessage(errors.property_type)}
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
                                error={getErrorMessage(errors.description)}
                            />
                        )}
                    />
                </div>
            </FormCard>
            <FormCard title="Price">
                <div className="w-full flex flex-col md:flex-row gap-6">
                    <Controller
                        name="price.amount"
                        control={control}
                        render={({ field }) => (
                            <FormControl
                                as='input'
                                labelText='Sale/Rent Price (₦)'
                                placeholder='0'
                                type="number"
                                min={0}
                                containerClass="w-full"
                                {...field}
                                error={getErrorMessage(errors.price?.amount)}
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
                                error={getErrorMessage(errors.price?.per)}
                            />
                        )}
                    />
                </div>
            </FormCard>
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
                                    error={getErrorMessage(errors.details?.bedroom)}
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
                                    error={getErrorMessage(errors.details?.bathroom)}
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
                                    error={getErrorMessage(errors.details?.parking_space)}
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
                                    error={getErrorMessage(errors.details?.land_area)}
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
                                    error={getErrorMessage(errors.details?.living_room)}
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
