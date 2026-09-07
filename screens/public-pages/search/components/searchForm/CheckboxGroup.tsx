'use client';

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { AMENITIES } from '@/lib/selectOptions';

type SearchCheckboxGroupProps = {
  className?: string;
  selectedFeatures: string[];
  onChange: (updatedFeatures: string[]) => void;
};

export default function SearchCheckboxGroup({
  className,
  selectedFeatures = [],
  onChange,
}: SearchCheckboxGroupProps) {

  // Check if every available option is checked
  const allChecked = useMemo(() => {
    return (
      AMENITIES.length > 0 &&
      selectedFeatures.length === AMENITIES.length
    );
  }, [selectedFeatures]);

  // Toggles an individual amenity checkmark using value
  const handleSingleCheck = (featureValue: string, checked: boolean) => {
    const updated = checked
      ? [...selectedFeatures, featureValue]
      : selectedFeatures.filter((item) => item !== featureValue);

    onChange(updated);
  };

  // Toggles the global "Select All" utility
  const handleCheckAll = () => {
    const updated = allChecked
      ? []
      : AMENITIES.map((item) => item.value);

    onChange(updated);
  };

  return (
    <div className={className}>
      {/* Global Master Select Toggle */}
      <div className="flex gap-2 items-center mb-3">
        <Checkbox
          id="select-all-features"
          checked={allChecked}
          onCheckedChange={() => handleCheckAll()}
          className="text-black"
        />
        <label 
          htmlFor="select-all-features" 
          className="text-sm font-medium cursor-pointer select-none"
        >
          Select all amenities
        </label>
      </div>

      {/* Feature Checkbox Grid Layer */}
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        {AMENITIES.map((feature) => {
          const isChecked = selectedFeatures.includes(feature.value);
          const inputId = `feature-${feature.value}`;

          return (
            <div
              className="flex gap-2 items-center"
              key={feature.value}
            >
              <Checkbox
                id={inputId}
                checked={isChecked}
                onCheckedChange={(value) =>
                  handleSingleCheck(feature.value, Boolean(value))
                }
                className="text-black"
              />
              <label 
                htmlFor={inputId} 
                className="text-sm cursor-pointer select-none text-neutral-700 hover:text-neutral-900"
              >
                {feature.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}