'use client';

import { Dispatch, SetStateAction } from 'react';
import { Grid } from '@/components/icons/grid';
import { Map } from '@/components/icons/map';

type ControlProps = {
	stackOrder: 'listings' | 'map';
	setStackOrder: (stackOrder: 'listings' | 'map') => void;
	setMap: Dispatch<SetStateAction<boolean>>;
};

export default function MobileMapControl({ stackOrder, setStackOrder, setMap }: ControlProps) {
	const handleStackOrder = (order: 'listings' | 'map') => {
		setStackOrder(order);
		// If transitioning to listings view, show standard grid list behavior.
		// If map view is selected, trigger full container toggle.
		setMap(order !== 'listings');
	};

	const activeClass = stackOrder === 'listings' ? 'bg-blue-500/20 text-primary' : 'text-neutral-600';
	const mapActiveClass = stackOrder === 'map' ? 'bg-blue-500/20 text-primary' : 'text-neutral-600';

	return (
		<div
			className={`flex md:hidden p-2 rounded-md z-50 fixed bottom-4 left-4 bg-neutral-200 justify-between transition-all duration-200
			${stackOrder === 'map' ? 'w-[calc(100%-4.7rem)]' : 'w-[calc(100%-2rem)]'}`}
		>
			<button
				type="button"
				onClick={() => handleStackOrder('listings')}
				className={`flex p-4 w-full gap-4 items-center hover:text-primary rounded-lg justify-center font-medium transition-colors ${activeClass}`}
			>
				<Grid />
				<span>Listings</span>
			</button>
			
			<button
				type="button"
				onClick={() => handleStackOrder('map')}
				className={`flex p-4 w-full gap-4 items-center hover:text-primary rounded-lg justify-center font-medium transition-colors ${mapActiveClass}`}
			>
				<Map />
				<span>Map</span>
			</button>
		</div>
	);
}