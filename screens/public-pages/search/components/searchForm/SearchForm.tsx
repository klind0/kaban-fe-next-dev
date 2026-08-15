'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import SearchFormItem from './SearchFormItem';
import CheckboxGroup from './CheckboxGroup';
import { Button } from '@/components/ui/button';
import FormControl from '@/components/universal/form-control';
import { IQueryParamsType } from '@/types/queryParamsType';
import { ListingState, PropertyCategory, Status } from '@/types/listingTypes';

type SearchFormProps = {
    className?: string;
    onSearchSubmit: (filters: Partial<IQueryParamsType>) => void;
    defaultValues?: Partial<IQueryParamsType>;
};

export default function SearchForm({
    className = '',
    onSearchSubmit,
    defaultValues,
}: SearchFormProps) {
    const [otherItems, setOtherItems] = useState(false);

    const handleOtherItems = () => setOtherItems(!otherItems);

    const {
        control,
        handleSubmit,
        watch,
    } = useForm<IQueryParamsType>({
        defaultValues: {
            status: undefined as Status | undefined,
            effectiveState: ListingState.PUBLISHED,
            startDate: '',
            endDate: '',
            page: 1,
            limit: 10,
            search: '',
            location: '',
            bedroom: 0,
            bathrooms: 0,
            category: undefined as PropertyCategory | undefined,
            tab: '',
            radius: 0,
            property_type: '',
            roomNo: '',
            price: '',
            min_price: 0,
            max_price: 0,
            features: [],
            ...defaultValues, 
        },
        mode: 'all',
    });

    const onSubmit = (data: IQueryParamsType) => {
        onSearchSubmit(data);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={`w-full flex flex-col mt-4 ${className}`}
        >
            <FormControl
                readOnly
                as="input"
                type="text"
                containerClass="cursor-pointer border-neutral-300 focus-within:border-primary transition"
                title="Advanced search"
                name="advanced_search"
                placeholder="Advanced Filter Options"
            />
            
            <div className="flex gap-3 flex-col mt-2">
                <SearchFormItem watch={watch} control={control} />
                
                <div className="flex items-center gap-2 py-1">
                    <Button
                        type="button"
                        onClick={handleOtherItems}
                        variant="outline"
                        className="flex items-center justify-center p-0 h-5 w-5 border-neutral-400 rounded-sm text-xs font-bold"
                    >
                        {otherItems ? '−' : '+'}
                    </Button>
                    <h3 className="text-sm font-medium text-neutral-700 select-none">Other Features</h3>
                </div>
                
                <div className={`transition-all duration-200 overflow-hidden ${!otherItems ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'}`}>
                    <Controller
                        name="features"
                        control={control}
                        render={({ field }) => (
                            <CheckboxGroup 
                                className="p-1" 
                                selectedFeatures={field.value || []} 
                                onChange={field.onChange} 
                            />
                        )}
                    />
                </div>
                
                <Button
                    type="submit"
                    className="cursor-pointer w-full mt-2 bg-primary text-white hover:bg-primary/90 font-medium transition"
                >
                    Apply Filters
                </Button>
            </div>
        </form>
    );
}