import { IQueryParamsType } from '@/types/queryParamsType';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

export interface HandleFilterChange {
    (key: keyof IQueryParamsType, value: string | number | undefined): void;
}

export function useQueryParams() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [filters, setFilters] = React.useState<IQueryParamsType>({
        status: searchParams.get('status') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
        search: searchParams.get('search') || undefined,
        location: searchParams.get('location') || undefined,
        bedroom: parseInt(searchParams.get('bedroom') || '0') || undefined,
        bathrooms: parseInt(searchParams.get('bathrooms') || '0') || undefined,
        priceMin: parseInt(searchParams.get('priceMin') || '0') || undefined,
        priceMax: parseInt(searchParams.get('priceMax') || '0') || undefined,
        category: (searchParams.get('category') as 'rent' | 'sale') || undefined,
    });

    const [pendingFilters, setPendingFilters] = React.useState<IQueryParamsType | null>(null);

    const updateURL = React.useCallback((newFilters: IQueryParamsType) => {
        setPendingFilters(newFilters);
    }, []);

    const handleQueryParamsChange: HandleFilterChange = React.useCallback(
        (key, value) => {
            setFilters(currentFilters => {
                const newFilters: IQueryParamsType = { ...currentFilters, [key]: value };

                if (key !== 'page') {
                    newFilters.page = 1;
                }

                updateURL(newFilters);
                return newFilters;
            });
        },
        [updateURL]
    );

    React.useEffect(() => {
        if (pendingFilters) {
            const params = new URLSearchParams(window.location.search);
            const excludeFromURL = ['page', 'limit'];

            Object.entries(pendingFilters).forEach(([key, value]) => {
                if (excludeFromURL.includes(key)) return;
                if (value !== undefined && value !== '' && value !== null) {
                    params.set(key, value.toString());
                } else {
                    params.delete(key);
                }
            });

            const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
            router.push(newURL, { scroll: false });
            setPendingFilters(null);
        }
    }, [pendingFilters, router]);

    return {
        filters,
        handleQueryParamsChange,
    };
}
