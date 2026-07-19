'use client';

import { useState } from 'react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import FormControl from '@/components/universal/form-control';
import { Checkbox } from '@/components/ui/checkbox';
import { IQueryParamsType } from '@/types/queryParamsType';
import { property_type, bathroom, bedroom, propertyStatusOptions } from '@/lib/selectOptions';

export default function SearchFormItem({
	control,
	watch
}: {
	control: Control<IQueryParamsType, any, IQueryParamsType>;
	watch: UseFormWatch<IQueryParamsType>
}) {
	const [isEnabled, setIsEnabled] = useState(false);

	const handleRadiusStatus = () => {
		setIsEnabled((prev) => !prev);
	};

	return (
		<div className="grid sm:grid-cols-2 gap-1 lg:grid-cols-4">
			{/* Radius Filter row */}
			<div className="flex my-1 sm:col-span-2 lg:col-span-4">
				<div className="flex items-center w-40 gap-2">
					<Checkbox checked={isEnabled} onCheckedChange={handleRadiusStatus} />
					<output className="text-sm font-medium">Radius {watch('radius') || 0}km</output>
				</div>
				<Controller
					name="radius"
					control={control}
					render={({ field }) => (
						<FormControl
							as="input"
							type="range"
							min="0"
							max="100"
							step="1"
							{...field}
							disabled={!isEnabled}
							containerClass="w-full"
						/>
					)}
				/>
			</div>

			{/* Location Field */}
			<Controller
				name="location"
				control={control}
				render={({ field }) => (
					<FormControl
						as="input"
						{...field}
						type="search"
						title="location"
						name="location"
						placeholder="Location"
						containerClass="sm:col-span-2"
					/>
				)}
			/>

			{/* Status Dropdown */}
			<Controller
				name="status"
				control={control}
				render={({ field }) => (
					<FormControl
						{...field}
						as="select"
						title="status"
						placeholder="Status"
						options={propertyStatusOptions}
						className="border"
					/>
				)}
			/>

			{/* Property Type Dropdown */}
			<Controller
				name="property_type"
				control={control}
				render={({ field }) => (
					<FormControl
						{...field}
						as="select"
						title="propertyType"
						placeholder="Property Type"
						options={property_type}
					/>
				)}
			/>

			{/* 💎 FIXED: Accepting the direct string value from FormControl's custom onChange handler */}
		<Controller
			name="bathrooms"
			control={control}
			render={({ field }) => (
				<FormControl
					{...field}
					as="select"
					placeholder="Bathrooms"
					options={bathroom}
					value={field.value === 0 ? "" : String(field.value)}
					onChange={(val: any) => field.onChange(Number(val) || 0)} // ✨ FIXED: Explicit parameter bypass
				/>
			)}
		/>

		<Controller
			name="bedrooms"
			control={control}
			render={({ field }) => (
				<FormControl
					{...field}
					as="select"
					placeholder="Bedrooms"
					options={bedroom}
					value={field.value === 0 ? "" : String(field.value)}
					onChange={(val: any) => field.onChange(Number(val) || 0)} // ✨ FIXED: Explicit parameter bypass
				/>
			)}
		/>

			{/* Pricing Filter Blocks */}
			<Controller
				name="min_price"
				control={control}
				render={({ field }) => (
					<FormControl
						as="input"
						{...field}
						title="Min Price"
						placeholder="Min Price"
						value={field.value === 0 ? '' : field.value}
						type="number"
					/>
				)}
			/>
			
			<Controller
				name="max_price"
				control={control}
				render={({ field }) => (
					<FormControl
						{...field}
						as="input"
						title="Max Price"
						value={field.value === 0 ? '' : field.value}
						placeholder="Max Price"
						type="number"
					/>
				)}
			/>
		</div>
	);
}