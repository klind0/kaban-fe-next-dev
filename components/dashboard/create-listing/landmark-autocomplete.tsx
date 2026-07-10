// components/dashboard/create-listing/landmark-autocomplete.tsx
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

    // Fetch autocomplete predictions using the new Places Library architecture
    useEffect(() => {
        if (!scriptLoaded || !inputValue || inputValue.length < 3 || !(window as any).google?.maps) {
            setSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                // Fix: Import the entire library instance to keep the correct execution context
                const placesLib = await (window as any).google.maps.importLibrary("places") as any;
                
                const request: any = {
                    input: inputValue,
                    componentRestrictions: { country: "ng" }, // Bound checks exclusively to Nigeria
                };

                // Fix: Access the class method straight through the library namespace
                const { predictions } = await placesLib.Place.getAutocompletePredictions(request);

                if (predictions) {
                    const formatted: PredictionItem[] = predictions.map((p: any) => ({
                        placeId: p.placeId,
                        mainText: p.text.mainText?.toString() || "",
                        secondaryText: p.text.secondaryText?.toString() || "",
                        description: p.description,
                    }));
                    setSuggestions(formatted);
                }
            } catch (err) {
                console.error("Autocomplete prediction retrieval failure:", err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, scriptLoaded]);

    // Handle user selection and extract precise coordinate offsets via Place class instances
    const handleSelect = async (s: PredictionItem) => {
        const selectedName = s.mainText || s.description;
        setInputValue(selectedName);
        onChange(selectedName);
        setIsFocused(false);
        setSuggestions([]);

        if (!(window as any).google?.maps) return;

        try {
            // Fix: Applied the matching pattern here to safeguard geocoding instantiations
            const placesLib = await (window as any).google.maps.importLibrary("places") as any;
            
            const placeInstance = new placesLib.Place({
                id: s.placeId,
                requestedFields: ["geometry.location"],
            });

            await placeInstance.fetchFields();

            const location = placeInstance.location;
            if (location) {
                onSelect(selectedName, location.lng(), location.lat());
            }
        } catch (err) {
            console.error("Geocoding coordinates resolution failure:", err);
        }
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
                            className="px-4 py-3 text-sm text-foreground hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-0"
                        >
                            <span className="font-semibold text-black">{s.mainText}</span>{" "}
                            <span className="text-xs text-neutral-500">{s.secondaryText}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}