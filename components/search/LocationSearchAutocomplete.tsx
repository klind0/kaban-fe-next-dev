"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X } from "lucide-react";

type LocationSearchAutocompleteProps = {
  value?: string;
  onSelectLocation: (searchTerm: string) => void;
  placeholder?: string;
  scriptLoaded: boolean;
};

interface PredictionItem {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export default function LocationSearchAutocomplete({
  value = "",
  onSelectLocation,
  placeholder = "Search city, state, street, or property ID...",
  scriptLoaded,
}: LocationSearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PredictionItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ignoreNextQueryRef = useRef(false);
  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // Sync initial input value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch Google Autocomplete Predictions
  useEffect(() => {
    if (!scriptLoaded || !inputValue || inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const mapsObj = (window as any).google?.maps;
    if (!mapsObj || !mapsObj.places) return;

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new mapsObj.places.AutocompleteService();
    }

    const delayDebounceFn = setTimeout(() => {
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
  }, [inputValue, scriptLoaded]);

  const handleSelect = (s: PredictionItem) => {
    ignoreNextQueryRef.current = true;
    setIsFocused(false);
    setSuggestions([]);

    const mapsObj = (window as any).google?.maps;
    if (!mapsObj) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new mapsObj.Geocoder();
    }

    // Geocode placeId to parse address components matching NestJS DB fields
    geocoderRef.current.geocode({ placeId: s.placeId }, (results: any[], status: string) => {
      if (status === "OK" && results?.[0]?.address_components) {
        const components = results[0].address_components;
        let route = "";
        let city = "";
        let state = "";

        components.forEach((c: any) => {
          const types: string[] = c.types;
          if (types.includes("route")) route = c.long_name;
          if (types.includes("locality") || types.includes("administrative_area_level_2")) {
            city = c.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = c.long_name;
          }
        });

        // Hierarchy fallback: Priority goes to City/State -> Street -> Google main text
        const bestSearchTerm = city || state || route || s.mainText;

        setInputValue(bestSearchTerm);
        onSelectLocation(bestSearchTerm);
      } else {
        // Fallback to main text if geocoding fails
        setInputValue(s.mainText);
        onSelectLocation(s.mainText);
      }
    });
  };

  const handleClear = () => {
    setInputValue("");
    setSuggestions([]);
    onSelectLocation("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsFocused(false);
      onSelectLocation(inputValue.trim());
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-neutral-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onSelectLocation(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          disabled={!scriptLoaded}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Predictions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-[60] top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className="px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer border-b border-neutral-100 dark:border-neutral-800 last:border-0 flex items-start gap-3"
            >
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm leading-tight">
                  {s.mainText}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
                  {s.secondaryText || s.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}