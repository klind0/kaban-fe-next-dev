'use client';

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { otherFeatures } from '@/lib/selectOptions';

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
      otherFeatures.length > 0 &&
      selectedFeatures.length === otherFeatures.length
    );
  }, [selectedFeatures]);

  // Toggles an individual amenity checkmark
  const handleSingleCheck = (featureTitle: string, checked: boolean) => {
    const updated = checked
      ? [...selectedFeatures, featureTitle]
      : selectedFeatures.filter((item) => item !== featureTitle);

    onChange(updated);
  };

  // Toggles the global "Select All" utility
  const handleCheckAll = () => {
    const updated = allChecked
      ? []
      : otherFeatures.map((item) => item.title);

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
        {otherFeatures.map((feature) => {
          const isChecked = selectedFeatures.includes(feature.title);
          const inputId = `feature-${feature.title.replace(/\s+/g, '-').toLowerCase()}`;

          return (
            <div
              className="flex gap-2 items-center"
              key={feature.title}
            >
              <Checkbox
                id={inputId}
                checked={isChecked}
                onCheckedChange={(value) =>
                  handleSingleCheck(feature.title, Boolean(value))
                }
                className="text-black"
              />
              <label 
                htmlFor={inputId} 
                className="text-sm cursor-pointer select-none text-neutral-700 hover:text-neutral-900"
              >
                {feature.title}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}