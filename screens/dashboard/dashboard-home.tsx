'use client';

import DashboardNavbar from '@/components/dashboard/dashboard-navbar';
import DashboardPageContainer from '@/components/dashboard/dashboard-page-container';
import { Button } from '@/components/ui/button';
import { IListing, IListingMeta } from '@/types/listingTypes';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchInput from '@/components/universal/search-input';
import CustomSelect, {
  SelectOption,
} from '@/components/universal/custom-select';
import { Arrow } from '@/components/icons/arrow';
import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import { Building2 } from '@/components/icons/buildings';
import ListingCard from '@/components/dashboard/listing-card';

interface DashboardHomeProps {
  listings: IListing[];
  meta: IListingMeta;
}

function getPaginationPages(
  current: number,
  total: number,
): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function DashboardHome({ listings, meta }: DashboardHomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = meta.page;
  const totalPages = meta.totalPages;
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPending, startTransition] = useTransition();

  // --- Action Handlers ---
  const handleDelete = (id: string) => {
    // Add delete logic / API call here
    console.log('Delete listing:', id);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/edit-listing/${id}`);
  };

  const handleRelist = (id: string) => {
    // Add relist logic / API call here
    console.log('Relist listing:', id);
  };

  const handleUpgrade = (id: string) => {
    // Add upgrade logic / API call here
    console.log('Upgrade listing:', id);
  };

  const statusOptions: SelectOption[] = [
    { name: 'Draft', value: 'DRAFT' },
    { name: 'All Status', value: 'ALL' },
    { name: 'Expired', value: 'EXPIRED' },
    { name: 'Rejected', value: 'REJECTED' },
    { name: 'Published', value: 'PUBLISHED' },
    { name: 'Pending Approval', value: 'PENDING_APPROVAL' },
  ];

  const [sortStatus, setSortStatus] = useState<string>('ALL');

  const filteredListings = useMemo(() => {
    if (sortStatus === 'ALL') return listings;

    return listings.filter((item) => {
      const isPastExpiration = item?.expiresAt && new Date(item.expiresAt).getTime() < Date.now();
      
      const rawState = (
        (item as any).effectiveState || item?.listing_state
      )?.toUpperCase();
      
      const currentItemState = isPastExpiration ? 'EXPIRED' : rawState;
      
      if (!currentItemState) return false;
      return currentItemState === sortStatus.toUpperCase();
    });
  }, [listings, sortStatus]);

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set('search', value);
        } else {
          params.delete('search');
        }
        params.set('page', '1');
        startTransition(() => {
          router.push(`?${params.toString()}`);
        });
      }, 400);
    },
    [router, searchParams],
  );

  return (
    <>
      <DashboardNavbar pageTitle="My listings">
        <Button asChild className="hidden md:inline-flex">
          <Link href="/dashboard/create-listing">Create listing</Link>
        </Button>
      </DashboardNavbar>

      <DashboardPageContainer className="py-4">
        <div className="flex items-center gap-4 py-4 justify-between">
          <SearchInput
            placeholder="Search listings"
            defaultValue={searchParams.get('search') ?? ''}
            onChange={handleSearch}
          />
          <CustomSelect
            placeholder="Filter by status"
            options={statusOptions}
            value={sortStatus}
            onChange={setSortStatus}
            className="w-full md:w-72"
          />
        </div>

        {filteredListings.length === 0 ? (
          <div className="border-2 rounded-md flex flex-col gap-2 mt-30 px-18 py-8 items-center justify-center justify-self-center bg-background">
            <div className="p-6 rounded-full border bg-primary/10 border-primary">
              <Building2 width="40" height="40" className="text-primary" />
            </div>
            <p className="font-bold text-black">Create a listing</p>
            <p className="text-gray-500">
              Click the button below to create a listing.
            </p>
            <Button onClick={() => router.push('/dashboard/create-listing')}>
              Create Listing
            </Button>
          </div>
        ) : (
          <div className="border border-neutral-600 rounded-2xl mt-8">
            <div className="p-3 border-b border-neutral-600">
              <div className="flex justify-end">
                <div className="bg-[#F5FAFF] p-1.5 rounded-lg">All</div>
              </div>
            </div>

            <div>
              {filteredListings.map((listing) => (
                <ListingCard 
					key={listing.id} 
					listing={listing}
					isPending={isPending} 
					onDelete={handleDelete}
					onEdit={handleEdit}
					onRelist={handleRelist}
					onUpgrade={handleUpgrade}
				/>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 border-t border-neutral-600">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
                className="flex items-center gap-1.5 disabled:opacity-40"
              >
                <Arrow /> <span className="text-sm font-medium">Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {getPaginationPages(currentPage, totalPages).map((page, i) =>
                  page === '...' ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-sm text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      disabled={isPending}
                      className={`min-w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-white'
                          : 'hover:bg-neutral-100 text-foreground'
                      } disabled:opacity-50`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || isPending}
                className="flex items-center gap-1.5 disabled:opacity-40"
              >
                <span className="text-sm font-medium">Next</span>{' '}
                <Arrow className="rotate-180" />
              </button>
            </div>
          </div>
        )}
      </DashboardPageContainer>
    </>
  );
}