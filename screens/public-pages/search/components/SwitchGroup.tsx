'use client';

import React from 'react';
import { MapIcon } from '@/components/icons/map';
import { Grid } from '@/components/icons/grid';
import { RowVertical } from '@/components/icons/row-vertical';
import { SortIcon } from '@/components/icons/sortIcon';
import { sortOptions } from '@/lib/selectOptions';
import CustomSelect from '@/components/universal/custom-select';

type Props = {
	mapState: boolean;
	onClick: () => void;
	onChange?: (value: string) => void;
	stackOrder: 'listings' | 'map';
	orientation?: 'portrait' | 'landscape';
	setOrientation?: (orientation: 'portrait' | 'landscape') => void;
};

export default function SwitchGroup({
	stackOrder,
	mapState,
	onClick,
	setOrientation,
	orientation,
}: Props) {
	const [sortValue, setSortValue] = React.useState<string>('');

	const handleOrientationChange = (newOrientation: 'portrait' | 'landscape') => {
		if (setOrientation) {
			setOrientation(newOrientation);
		}
	};

	return (
		<div className="flex my-2 justify-between items-center bg-white p-1 rounded-md">
			<span className="text-sm text-neutral-600 font-medium">Results Found</span>
			
			<div className="flex items-center gap-2">
				{/* Sorting Controls */}
				<div className="flex items-center gap-1 border border-neutral-200 rounded-md px-2 py-0.5">
					<SortIcon width="20px" height="20px" className="text-neutral-500" />
					<CustomSelect
						className="border-none text-sm bg-transparent focus:ring-0 cursor-pointer"
						placeholder="Sort by"
						options={sortOptions}
						value={sortValue}
						onChange={(val) => setSortValue(val)}
					/>
				</div>

				{/* Desktop Layout View Toggles (Grid vs Row List) */}
				<div className="gap-3 sm:flex hidden items-center border-l border-neutral-200 pl-2">
					<button
						type="button"
						aria-label="List view layout"
						onClick={() => handleOrientationChange('landscape')}
						className={`p-1 rounded hover:bg-neutral-100 transition-colors ${
							orientation === 'landscape' ? 'text-primary bg-blue-50' : 'text-neutral-400'
						}`}
					>
						<RowVertical className="w-5 h-5" />
					</button>
					
					<button
						type="button"
						aria-label="Grid view layout"
						onClick={() => handleOrientationChange('portrait')}
						className={`p-1 rounded hover:bg-neutral-100 transition-colors ${
							orientation === 'portrait' ? 'text-primary bg-blue-50' : 'text-neutral-400'
						}`}
					>
						<Grid className="w-5 h-5" />
					</button>
				</div>

				{/* Map Split Screen Toggle (Desktop view edge case control) */}
				<button
					type="button"
					aria-label="Toggle map side-panel"
					onClick={onClick}
					className="md:flex hidden items-center border-l border-neutral-200 pl-2 cursor-pointer"
				>
					<MapIcon
						className={`w-10 h-6 transition-colors ${
							!mapState ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600'
						}`}
					/>
				</button>
			</div>
		</div>
	);
}