
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X } from "lucide-react";

type LocationSearchAutocompleteProps = {
  value?: string;
  onChange: (value: string) => void;
  onSelectLocation: (locationTerm: string) => void;
  placeholder?: string;
  error?: boolean;
  scriptLoaded?: boolean;
};

interface PredictionItem {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

export default function LocationSearchAutocomplete({
  value = "",
  onChange,
  onSelectLocation,
  placeholder = "Search location or property ID...",
  error = false,
  scriptLoaded = true,
}: LocationSearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PredictionItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ignoreNextQueryRef = useRef(false);
  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // Sync external filter value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle outside clicks to dismiss dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Google Places Autocomplete Predictions
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
    if (!mapsObj) {
      setInputValue(s.mainText);
      onChange(s.mainText);
      onSelectLocation(s.mainText);
      return;
    }

    if (!geocoderRef.current) {
      geocoderRef.current = new mapsObj.Geocoder();
    }

    // Geocode placeId to isolate specific city or state for NestJS backend matching
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

        // Pick cleanest term (e.g., "Uyo", "Akwa Ibom", or "Aka Road")
        const bestSearchTerm = city || state || route || s.mainText;

        setInputValue(bestSearchTerm);
        onChange(bestSearchTerm);
        onSelectLocation(bestSearchTerm);
      } else {
        setInputValue(s.mainText);
        onChange(s.mainText);
        onSelectLocation(s.mainText);
      }
    });
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    onSelectLocation("");
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-muted-foreground" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 h-11 bg-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            error ? "border-destructive focus:border-destructive" : "border-input focus:border-primary"
          }`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Predictions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-[60] top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto py-1">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
              className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border/50 last:border-0 flex items-start gap-3 transition-colors"
            >
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-popover-foreground text-sm leading-tight">
                  {s.mainText}
                </span>
                <span className="text-xs text-muted-foreground leading-normal mt-0.5">
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