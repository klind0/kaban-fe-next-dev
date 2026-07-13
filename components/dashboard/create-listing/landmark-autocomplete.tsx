"use client";

import React, { useState, useEffect, useRef } from "react";

type LandmarkAutocompleteProps = {
    value: string;
    onChange: (value: string) => void;
    onSelect: (landmarkName: string, lng: number, lat: number) => void;
    error?: string;
    scriptLoaded: boolean;
};

interface PredictionItem {
    placeId: string;
    mainText: string;
    secondaryText: string;
    description: string;
}

export default function LandmarkAutocomplete({ value, onChange, onSelect, error, scriptLoaded }: LandmarkAutocompleteProps) {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<PredictionItem[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitialSync = useRef(true);
    
    // Track selections to prevent redundant queries right after clicking an option
    const ignoreNextQueryRef = useRef(false);
    
    // Persistent instance references to prevent continuous allocation thrashing
    const autocompleteServiceRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);

    // Synchronize incoming initial default values cleanly
    useEffect(() => {
        if (value && isInitialSync.current) {
            setInputValue(value);
            isInitialSync.current = false;
        }
    }, [value]);

    // Close suggestions dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Fetch autocomplete predictions safely using window namespace matching location-form.tsx loading
    useEffect(() => {
        if (!scriptLoaded || !inputValue || inputValue.length < 3) {
            setSuggestions([]);
            return;
        }

        const mapsObj = (window as any).google?.maps;
        if (!mapsObj || !mapsObj.places) return;

        // Lazy load service singletons securely
        if (!autocompleteServiceRef.current) {
            autocompleteServiceRef.current = new mapsObj.places.AutocompleteService();
        }

        const delayDebounceFn = setTimeout(() => {
            // Check against our selection flag instead of direct equality
            if (ignoreNextQueryRef.current) {
                ignoreNextQueryRef.current = false;
                return;
            }

            const request = {
                input: inputValue,
                componentRestrictions: { country: "ng" },
            };

            autocompleteServiceRef.current.getPlacePredictions(
                request,
                (predictions: any[], status: string) => {
                    if (status === "OK" && predictions) {
                        const formatted: PredictionItem[] = predictions.map((p) => ({
                            placeId: p.place_id,
                            mainText: p.structured_formatting?.main_text || "",
                            secondaryText: p.structured_formatting?.secondary_text || "",
                            description: p.description,
                        }));
                        setSuggestions(formatted);
                    } else {
                        setSuggestions([]);
                    }
                }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, scriptLoaded]); // Removed value dependency here to prevent extra resets

    const handleSelect = async (s: PredictionItem) => {
        const selectedName = s.mainText || s.description;
        
        // Signal that the subsequent input synchronization should be ignored by the API call
        ignoreNextQueryRef.current = true;

        // Immediately close down structural popups to avoid text-change race conditions
        setIsFocused(false);
        setSuggestions([]);
        setInputValue(selectedName);
        onChange(selectedName);

        const mapsObj = (window as any).google?.maps;
        if (!mapsObj) return;

        if (!geocoderRef.current) {
            geocoderRef.current = new mapsObj.Geocoder();
        }

        // Resolving precise geometry details from the selection ID
        geocoderRef.current.geocode({ placeId: s.placeId }, (results: any[], status: string) => {
            if (status === "OK" && results?.[0]?.geometry?.location) {
                const loc = results[0].geometry.location;
                onSelect(selectedName, loc.lng(), loc.lat());
            } else {
                console.error("Geocoding coordinates resolution failure state:", status);
            }
        });
    };

    return (
        <div ref={containerRef} className="flex flex-col gap-1 w-full relative">
            <div className="flex items-center justify-between">
                <label className="text-foreground text-sm font-medium">Nearest Landmark *</label>
                {error && <span className="text-[#B02817] text-xs sm:text-sm whitespace-nowrap">{error}</span>}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    onChange(e.target.value);
                }}
                onFocus={() => setIsFocused(true)}
                disabled={!scriptLoaded}
                placeholder="Search closest hotel, bank, fuel station, plaza..."
                className={`${error ? 'border-[#B02817]' : 'border-neutral-700'} border rounded-sm h-11 outline-none p-3 text-base w-full font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary`}
            />
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute z-[60] top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((s) => (
                        <li
                            key={s.placeId}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(s)}
                            className="px-4 py-2.5 hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-0 flex flex-col items-start gap-0.5"
                        >
                            {/* Main Heading Text */}
                            <span className="font-semibold text-neutral-900 text-sm block leading-tight">
                                {s.mainText}
                            </span>
                            {/* Clearer, Higher Contrast Subtext Address */}
                            <span className="text-xs text-neutral-600 block leading-normal font-normal">
                                {s.secondaryText || s.description}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}