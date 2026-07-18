'use client';

import { useState } from 'react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import FormControl from '@/components/universal/form-control';
import { Checkbox } from '@/components/ui/checkbox';
import { property_type, roomAndPrice, tabOptions } from '@/lib/selectOptions';
import { IQueryParamsType } from '@/types/queryParamsType';

interface SearchFormItemProps {
	control: Control<IQueryParamsType, any, IQueryParamsType>;
	watch: UseFormWatch<IQueryParamsType>;
}

export default function SearchFormItem({ control, watch }: SearchFormItemProps) {
	const [isEnabled, setIsEnabled] = useState(false);

	const handleRadiusStatus = () => {
		setIsEnabled((prev) => !prev);
	};

	return (
		<div className="grid sm:grid-cols-2 gap-2 lg:grid-cols-4">
			{/* Radius Filter Toggle Slider */}
			<div className="flex my-1 sm:col-span-2 lg:col-span-4 items-center gap-4">
				<div className="flex items-center w-40 gap-2 shrink-0">
					<Checkbox id="radius-toggle" checked={isEnabled} onCheckedChange={handleRadiusStatus} />
					<label htmlFor="radius-toggle" className="text-sm font-medium cursor-pointer">
						Radius {watch('radius') || 0}km
					</label>
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
							containerClass="w-full flex items-center"
						/>
					)}
				/>
			</div>

			{/* Location Query Input */}
			<Controller
				name="location"
				control={control}
				render={({ field }) => (
					<FormControl
						as="input"
						{...field}
						type="search"
						title="location"
						placeholder="Location (e.g., Uyo)"
						containerClass="sm:col-span-2"
					/>
				)}
			/>

			{/* Listing Status Dropdown (e.g., Buy, Rent) */}
			<Controller
				name="status"
				control={control}
				render={({ field }) => (
					<FormControl
						{...field}
						as="select"
						title="status"
						placeholder="Status"
						options={tabOptions}
						className="border"
					/>
				)}
			/>

			{/* Property Type Dropdown (e.g., Flat, Self-contain, Commercial) */}
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

			{/* Dynamic Select Filters (Bedrooms, Bathrooms, etc.) */}
			{Object.entries(roomAndPrice).map(([key, val], id) => (
				<Controller
					key={key}
					name={key as any}
					control={control}
					render={({ field }) => (
						<FormControl
							{...field}
							key={id}
							as="select"
							title={key}
							placeholder={key.replace('_', ' ')}
							options={val.subItems}
						/>
					)}
				/>
			))}

			{/* Min Price Field */}
			<Controller
				name="min_price"
				control={control}
				render={({ field }) => (
					<FormControl
						as="input"
						{...field}
						title="Min Price"
						placeholder="Min Price"
						// 🛠️ FIXED: Replaced 'l' typo with standard fallback empty string
						value={field.value === 0 || !field.value ? '' : field.value} 
						type="number"
					/>
				)}
			/>

			{/* Max Price Field */}
			<Controller
				name="max_price"
				control={control}
				render={({ field }) => (
					<FormControl
						as="input"
						{...field}
						title="Max Price"
						placeholder="Max Price"
						// 🛠️ FIXED: Replaced 'l' typo with standard fallback empty string
						value={field.value === 0 || !field.value ? '' : field.value} 
						type="number"
					/>
				)}
			/>
		</div>
	);
}