// components/dashboard/create-listing/landmark-autocomplete.tsx
import React, { useState, useEffect, useRef } from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

type LandmarkAutocompleteProps = {
    value: string;
    onChange: (value: string) => void;
    onSelect: (landmarkName: string, lng: number, lat: number) => void;
    error?: string;
    scriptLoaded: boolean;
};

export default function LandmarkAutocomplete({ value, onChange, onSelect, error, scriptLoaded }: LandmarkAutocompleteProps) {
    const {
        ready,
        value: textValue,
        suggestions: { status, data },
        setValue: setAutocompleteValue,
        clearSuggestions,
        init,
    } = usePlacesAutocomplete({
        requestOptions: { componentRestrictions: { country: "ng" } },
        debounce: 300,
        cache: 86400,
        initOnMount: false,
    });

    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scriptLoaded) init();
    }, [scriptLoaded, init]);

    const isInitialSync = useRef(true);
    useEffect(() => {
        if (value && isInitialSync.current) {
            setAutocompleteValue(value, false);
            isInitialSync.current = false;
        }
    }, [value, setAutocompleteValue]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsFocused(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col gap-1 w-full relative">
            <div className="flex items-center justify-between">
                <label className="text-foreground text-sm font-medium">Nearest Landmark *</label>
                {error && <span className="text-[#B02817] text-xs sm:text-sm whitespace-nowrap">{error}</span>}
            </div>
            <input
                type="text"
                value={textValue}
                onChange={(e) => {
                    setAutocompleteValue(e.target.value, true);
                    onChange(e.target.value);
                }}
                onFocus={() => setIsFocused(true)}
                disabled={!ready}
                placeholder="Search closest hotel, bank, fuel station, plaza..."
                className={`${error ? 'border-[#B02817]' : 'border-neutral-700'} border rounded-sm h-11 outline-none p-3 text-base w-full font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary`}
            />
            {isFocused && status === "OK" && (
                <ul className="absolute z-[60] top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {data.map((s) => (
                        <li
                            key={s.place_id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                const name = s.structured_formatting.main_text;
                                setAutocompleteValue(name, false);
                                onChange(name);
                                setIsFocused(false);
                                clearSuggestions();
                                
                                getGeocode({ placeId: s.place_id })
                                    .then((res) => getLatLng(res[0]))
                                    .then(({ lat, lng }) => onSelect(name, lng, lat))
                                    .catch((err) => console.error("Geocoding failure:", err));
                            }}
                            className="px-4 py-3 text-sm text-foreground hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-0"
                        >
                            <span className="font-semibold text-black">{s.structured_formatting.main_text}</span>{" "}
                            <span className="text-xs text-neutral-500">{s.structured_formatting.secondary_text}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}