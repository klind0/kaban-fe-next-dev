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
import Image from 'next/image';
import DefaultPropertyImg from '@/app/assets/images/blank-img.png';
import { Location } from '@/components/icons/location';
import { Trash } from '@/components/icons/trash';
import { Edit } from '@/components/icons/edit';
import { RefreshRightSquare } from '@/components/icons/refresh-right-square';
import { SendSqaure2 } from '@/components/icons/send-sqaure-2';
import { Arrow } from '@/components/icons/arrow';
import { formatPrice } from '@/lib/formatPrice';
import { formatDateTime } from '@/lib/formatDateAndTime';
import ListingStateBadge from '@/components/dashboard/listing-state-badge';
import { Camera } from '@/components/icons/camera';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Building2 } from '@/components/icons/buildings';

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

	const statusOptions: SelectOption[] = [
		{ name: 'Draft', value: 'DRAFT' },
		{ name: 'All Status', value: 'ALL' },
		{ name: 'Expired', value: 'EXPIRED' },
		{ name: 'Rejected', value: 'REJECTED' },
		{ name: 'Published', value: 'PUBLISHED' },
		{ name: 'Pending Approval', value: 'PENDING_APPROVAL' },
	];

	const [sortStatus, setSortStatus] = useState<string>('ALL'); // current filter

	// Main sort/filter function
	const filteredListings = useMemo(() => {
		if (sortStatus === 'ALL') return listings;
		
		return listings.filter((item) => {
			const currentItemState = item.listing_state || (item as any).effectiveState;
			
			if (!currentItemState) return false;
			
			return currentItemState.toUpperCase() === sortStatus.toUpperCase();
		});
	}, [listings, sortStatus]);

	function goToPage(page: number) {
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', String(page));
		router.push(`?${params.toString()}`);
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
				router.push(`?${params.toString()}`);
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
						className="w-full md:w-72" // adjust width as needed
					/>
				</div>
				{filteredListings.length === 0 ? (
          <div className="border-2 rounded-md flex flex-col gap-2 mt-30 px-18 py-8 items-center justify-center justify-self-center bg-background">
            <div className='p-6 rounded-full border bg-primary/10 border-primary'>
              <Building2 width="40" height="40" className='text-primary'/>
            </div>
            <p className="font-bold text-black">Create a listing</p>
            <p className="text-gray-500">Click the button below to create a listing.</p>
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
						{filteredListings?.map((listing, index) => (
							<div
								key={index}
								className="py-3 px-6 border-b border-neutral-600 last:border-0 flex max-sm:flex-col md:max-lg:flex-col gap-4"
							>
								<div className="w-full lg:max-w-75 md:max-lg:w-full h-46.75 relative">
									<div className="absolute top-4 left-4 flex items-center gap-1 z-10">
										<Camera />
										<span className="text-white font-medium">
											{listing?.images?.length || 0}
										</span>
									</div>
									<Image
										src={listing?.images?.[0]?.url || DefaultPropertyImg}
										fill
										alt="Property image"
										className="object-cover rounded-md w-full"
									/>
								</div>
								<div className="w-full flex flex-col justify-between">
									<div className="flex w-full h-full justify-between">
										<div className="flex w-full flex-col text-foreground">
											<div className="flex">
												<div>
													<span className="text-sm">
														{listing?.property_type}
													</span>
													<h3 className="text-xl font-bold -tracking-[0.1px]">
														{formatPrice(listing?.price?.amount || 0)}
													</h3>
												</div>
												<div className="flex justify-end w-full gap-2">
													{
														<div className="w-fit flex h-fit bg-[#006AFF]/10 text-primary text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2">
															●{' '}
															{listing?.status.charAt(0).toUpperCase() +
																listing?.status.slice(1)}
														</div>
													}
													{listing?.isFeatured && (
														<div
															className={`w-fit h-fit bg-[#41AE49]/10 text-[#41AE49] text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2`}
														>
															● Featured
														</div>
													)}
													<ListingStateBadge state={listing?.listing_state} />
												</div>
											</div>
											<p className="text-lg truncate text-primary font-semibold">
												{listing?.title || 'No title'}
											</p>
											<div className="flex items-center gap-1 text-gray-50">
												<Location />
												<span className="font-medium">{`${listing?.location?.address}, ${listing?.location?.city}, ${listing?.location?.state}`}</span>
											</div>
										</div>
									</div>
									<div className="h-full gap-2 mt-2 flex max-sm:flex-col sm:items-end justify-between">
										<span className="text-xs font-medium">
											Submitted: {formatDateTime(listing?.createdAt)}
										</span>
										{listing?.expiresAt && (
											<span className="text-xs font-medium">
												Expired: {formatDateTime(listing?.expiresAt)}
											</span>
										)}
										<div className="flex items-center gap-2">
											<button>
												<Trash />
											</button>
											<button>
												<Edit />
											</button>
											<button>
												<RefreshRightSquare />
											</button>
											<button>
												<SendSqaure2 />
											</button>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between p-3 border-t border-neutral-600">
						<button
							onClick={() => goToPage(currentPage - 1)}
							disabled={currentPage <= 1}
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
										className={`min-w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
											page === currentPage
												? 'bg-primary text-white'
												: 'hover:bg-neutral-100 text-foreground'
										}`}
									>
										{page}
									</button>
								),
							)}
						</div>
						<button
							onClick={() => goToPage(currentPage + 1)}
							disabled={currentPage >= totalPages}
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
