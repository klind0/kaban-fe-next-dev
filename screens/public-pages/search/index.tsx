'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

// Core UI Components
import Container from '@/components/universal/Container';
import ListingCard from '@/components/universal/listing-card';
import MobileMapControl from './components/MobileMapControl';
import SwitchGroup from './components/SwitchGroup';
import SearchForm from './components/searchForm/SearchForm';

// Assets & GraphQL Clients
import background from '@/app/assets/images/hero-bg.webp';
import { QUERY_KEY } from '@/enum/queryKeys';
import { gqlRequest } from '@/network/graphql-client';
// 💡 CHANGE: We import a public query instead of a private dashboard query
import { PUBLIC_SEARCH_LISTINGS_QUERY } from '@/network/gql/publicListings.ql'; 
import { IListingResponse } from '@/types/listingTypes';

type ResultsProps = {
	initialSearchTerm?: string;
};

export default function SearchResultsPage({ initialSearchTerm }: ResultsProps) {
	const [position, setPosition] = useState<'portrait' | 'landscape'>('portrait');
	const [stackOrder, setStackOrder] = useState<'listings' | 'map'>('listings');
	const [map, setMap] = useState(false);

	// 🛠️ FIXED: Query changed to fetch public market data rather than private profile listings
	const { data: searchData, isLoading } = useQuery({
		queryKey: [QUERY_KEY.PUBLIC_LISTINGS, initialSearchTerm],
		queryFn: () =>
			gqlRequest<{ publicListings: IListingResponse }>(PUBLIC_SEARCH_LISTINGS_QUERY, {
				filter: {
					search: initialSearchTerm || "",
					status: "APPROVED" // Ensure unapproved drafts don't leak out
				},
				limit: 20,
			}),
	});

	const listings = searchData?.publicListings?.data ?? [];

	// Responsive hook logic for map presentation layers
	const { mediasize } = useResponsiveNav({});
	useEffect(() => {
		mediasize === 'mobile'
			? stackOrder === 'map'
				? setMap(false)
				: setMap(true)
			: setMap(false);
	}, [mediasize]);

	const toggleMap = () => {
		setMap(!map);
	};

	const listingsPage =
		stackOrder === 'listings'
			? 'relative'
			: 'fixed w-0 overflow-hidden md:relative md:w-full md:overflow-auto';
			
	const order =
		position === 'portrait'
			? 'grid-cols-[repeat(auto-fit,minmax(19rem,1fr))]'
			: 'grid-cols-[repeat(auto-fit,minmax(30rem,1fr))]';

	const mapPage =
		stackOrder === 'map' && mediasize === 'mobile'
			? 'fixed top-[11rem] left-0 w-full'
			: '';
			
	const renderMap = !map ? 'w-[60%]' : 'w-0 opacity-0';

	return (
		<Container
			element="section"
			className={`flex w-full ${!map ? 'md:gap-4 xl:pe-16' : 'md:gap-0 md:px-16'}`}
		>
			{/* Interactive Map Visual Layer */}
			<div className={`transition-all delay-100 ${renderMap} ${mapPage}`}>
				<div className={'h-[95vh] border-red-600 top-4 sticky'}>
					<Image
						src={background}
						className="w-full rounded-lg h-full object-cover object-top"
						alt="Search map background layout view"
						priority
					/>
				</div>
			</div>

			{/* Responsive Mobile Layout State Toggles */}
			<MobileMapControl
				setMap={setMap}
				stackOrder={stackOrder}
				setStackOrder={setStackOrder}
			/>

			{/* Grid Feed Container */}
			<div className={`w-full`}>
				<div
					className={`${stackOrder === 'map' && mediasize === 'mobile' && 'p-[3%] bg-neutral-100 fixed inset-x-0 top-0 max-h-[11.8rem] pt-20 w-screen'}`}
				>
					<div className="text-sm text-neutral-500 mb-1">
						<Link href={'/'} className="text-primary hover:underline">Home</Link>
						<span> / For Rent</span>
					</div>

					<h3 className="text-2xl font-semibold capitalize mb-2">Available Rental Listings</h3>
					
					<SwitchGroup
						mapState={map}
						onClick={toggleMap}
						stackOrder={stackOrder}
						orientation={position}
						setOrientation={setPosition}
					/>
					
					<SearchForm
						className={`${stackOrder === 'map' && mediasize === 'mobile' ? 'opacity-0 invisible max-h-0' : ''}`}
					/>
				</div>

				{/* Cards Dynamic View Engine */}
				{isLoading ? (
					<div className="py-12 text-center text-neutral-500">Loading properties matching your search...</div>
				) : listings.length === 0 ? (
					<div className="py-12 text-center text-neutral-500">No properties found matching those search criteria.</div>
				) : (
					<div className={`top-4 grid gap-4 transition-all delay-100 ${listingsPage} ${order}`}>
						{listings.map((listing) => (
							<ListingCard key={listing?.id} listingData={listing} />
						))}
					</div>
				)}
			</div>
		</Container>
	);
}