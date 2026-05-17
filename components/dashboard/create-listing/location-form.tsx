import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { IListing } from "@/types/listingTypes";
import { Controller, useForm, useWatch } from "react-hook-form";
import FormCard from "./form-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Map, { MapRef, Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Location } from "@/components/icons/location";
import { LocationListingData } from "@/network/listings";
import { nigeriaCitiesByState, nigerianStates } from "@/lib/selectOptions";
import React from "react";

type LocationFormValues = {
    location: IListing["location"];
    agreement: boolean;
};

type Suggestion = {
    id: string;
    place_name: string;
    text: string;
    address?: string;
    center: [number, number];
    context?: { id: string; text: string }[];
};

function formatSuggestion(s: Suggestion): string {
    const parts: string[] = [];
    const streetPart = s.address ? `${s.address} ${s.text}` : s.text;
    parts.push(streetPart);
    const city = s.context?.find(c => c.id.startsWith('place') || c.id.startsWith('locality'))?.text;
    if (city) parts.push(city);
    const state = s.context?.find(c => c.id.startsWith('region'))?.text;
    if (state) parts.push(state);
    return parts.join(', ');
}

type AddressAutocompleteProps = {
    value: string;
    onChange: (value: string) => void;
    onSelect: (address: string, lng: number, lat: number, state?: string, city?: string) => void;
    error?: string;
};

function AddressAutocomplete({ value, onChange, onSelect, error }: AddressAutocompleteProps) {
    const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
    const [open, setOpen] = React.useState(false);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const fetchSuggestions = React.useCallback(async (query: string) => {
        if (query.length < 3) { setSuggestions([]); return; }
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=ng&limit=5&types=address,place,neighborhood,locality`
        );
        const data = await res.json();
        setSuggestions(data.features ?? []);
        setOpen(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
    };

    const handleSelect = (s: Suggestion) => {
        const [lng, lat] = s.center;
        const formatted = formatSuggestion(s);
        const mapboxState = s.context?.find(c => c.id.startsWith('region'))?.text;
        const mapboxCity = s.context?.find(c => c.id.startsWith('place') || c.id.startsWith('locality'))?.text;
        onChange(formatted);
        onSelect(formatted, lng, lat, mapboxState, mapboxCity);
        setSuggestions([]);
        setOpen(false);
    };

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={containerRef} className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-baseline">
                <div className="w-full flex justify-between">
                    <label className="text-foreground text-sm font-medium">Address *</label>
                </div>
                {error && (
                    <span className="text-[#B02817] text-xs sm:text-sm whitespace-nowrap">{error}</span>
                )}
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => suggestions.length > 0 && setOpen(true)}
                    placeholder="Enter address"
                    className={`${error ? 'border-[#B02817]' : 'border-neutral-700'} border rounded-sm h-11 outline-none p-3 text-base w-full font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none`}
                />
                {open && suggestions.length > 0 && (
                    <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((s) => (
                            <li
                                key={s.id}
                                onMouseDown={() => handleSelect(s)}
                                className="px-4 py-3 text-sm text-foreground hover:bg-neutral-100 cursor-pointer border-b border-neutral-100 last:border-0"
                            >
                                {formatSuggestion(s)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

type Props = {
    onFormSubmit: (data: LocationListingData, submit: boolean) => Promise<void>;
    isPending: boolean;
    onBack: () => void;
};

export default function LocationForm({ onFormSubmit, isPending, onBack }: Props) {
    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<LocationFormValues>({
        defaultValues: {
            location: {
                state: "",
                city: "",
                address: "",
                landmark: "",
                coordinates: [6.5244, 3.3792], // [latitude, longitude]
            },
            agreement: false,
        },
        mode: "all",
    });

    const mapRef = React.useRef<MapRef>(null);

    const coordinates = useWatch({ control, name: "location.coordinates" });
    const selectedState = useWatch({ control, name: "location.state" });
    const latitude = coordinates?.[0] ?? 6.5244;
    const longitude = coordinates?.[1] ?? 3.3792;

    const cityOptions = selectedState ? (nigeriaCitiesByState[selectedState] ?? []) : [];

    // Smoothly fly map to coordinates when manually updated via lat/lng input fields
    React.useEffect(() => {
        if (mapRef.current) {
            mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                duration: 1200,
            });
        }
    }, [latitude, longitude]);

    const onSubmit = (data: LocationFormValues) => {
        if (!data.agreement) return;
        onFormSubmit({ location: data.location }, true);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-7.5 mt-8">
            {/* Location card */}
            <FormCard title="Location">
                <div className="space-y-6">
                    <Controller
                        name="location.address"
                        control={control}
                        rules={{ required: "This field is required" }}
                        render={({ field }) => (
                            <AddressAutocomplete
                                value={field.value}
                                onChange={field.onChange}
                                onSelect={(address, lng, lat, mapboxState, mapboxCity) => {
                                    field.onChange(address);
                                    setValue("location.coordinates", [lat, lng]);

                                    if (mapboxState) {
                                        const normalized = mapboxState
                                            .replace(/\s+State$/i, '')
                                            .replace(/Federal Capital Territory/i, 'FCT')
                                            .trim();
                                        const stateMatch = nigerianStates.find(
                                            s => s.value.toLowerCase() === normalized.toLowerCase()
                                        );
                                        if (stateMatch) {
                                            setValue("location.state", stateMatch.value);
                                            setValue("location.city", "");
                                            if (mapboxCity) {
                                                const cityList = nigeriaCitiesByState[stateMatch.value] ?? [];
                                                const cityMatch = cityList.find(
                                                    c => c.value.toLowerCase() === mapboxCity.toLowerCase()
                                                );
                                                if (cityMatch) setValue("location.city", cityMatch.value);
                                            }
                                        }
                                    }
                                }}
                                error={getErrorMessage(errors.location?.address)}
                            />
                        )}
                    />
                    <div className="w-full flex flex-col md:flex-row gap-6">
                        <Controller
                            name="location.state"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field }) => (
                                <FormControl
                                    as="select"
                                    labelText="State"
                                    placeholder="Select state"
                                    required
                                    containerClass="w-full"
                                    options={nigerianStates}
                                    value={field.value}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue("location.city", "");
                                    }}
                                    error={getErrorMessage(errors.location?.state)}
                                />
                            )}
                        />
                        <Controller
                            name="location.city"
                            control={control}
                            rules={{ required: "This field is required" }}
                            render={({ field }) => (
                                <FormControl
                                    as="select"
                                    labelText="City"
                                    placeholder={selectedState ? "Select city" : "Select a state first"}
                                    required
                                    containerClass="w-full"
                                    options={cityOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={getErrorMessage(errors.location?.city)}
                                />
                            )}
                        />
                    </div>
                </div>
            </FormCard>

            {/* Map card */}
            <FormCard title="Map">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Map preview */}
                    <div className="w-full md:w-1/2 rounded-lg overflow-hidden min-h-60 relative border border-neutral-200">
                        <Map
                            ref={mapRef}
                            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                            viewState={{ longitude: longitude, latitude: latitude, zoom: 13 }}
                            style={{ width: "100%", height: "100%", minHeight: "240px" }}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            scrollZoom={false}
                        >
                            <NavigationControl position="top-right" />
                            <Marker longitude={longitude} latitude={latitude} anchor="bottom">
                                <Location className="text-red-500 w-7 h-7 drop-shadow" />
                            </Marker>
                        </Map>
                    </div>

                    {/* Map fields */}
                    <div className="w-full md:w-1/2 space-y-5">
                        <Controller
                            name="location.landmark"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as="input"
                                    labelText="Landmark"
                                    placeholder="Nearest major road/landmark"
                                    type="text"
                                    containerClass="w-full"
                                    {...field}
                                    error={getErrorMessage(errors.location?.landmark)}
                                />
                            )}
                        />
                        <Controller
                            name="location.coordinates.1"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as="input"
                                    labelText="Longitude"
                                    type="number"
                                    step="any"
                                    containerClass="w-full"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                                />
                            )}
                        />
                        <Controller
                            name="location.coordinates.0"
                            control={control}
                            render={({ field }) => (
                                <FormControl
                                    as="input"
                                    labelText="Latitude"
                                    type="number"
                                    step="any"
                                    containerClass="w-full"
                                    {...field}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
                                />
                            )}
                        />
                    </div>
                </div>
            </FormCard>

            {/* Agreement card */}
            <div className="p-4 md:p-8 space-y-4 rounded-[10px] border border-neutral-600">
                <div className="flex items-center justify-between">
                    <h3 className="text-black text-2xl font-semibold">
                        Agreement <span className="text-[#B02817]">*</span>
                    </h3>
                    {errors.agreement && (
                        <span className="text-[#B02817] text-xs sm:text-sm whitespace-nowrap">
                            This field is required
                        </span>
                    )}
                </div>
                <Controller
                    name="agreement"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5"
                            />
                            <span className="text-sm text-foreground">
                                I consent that I am an authorized marketing representative of the above described real estate property.
                            </span>
                        </label>
                    )}
                />
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" className="md:min-w-30" onClick={onBack} disabled={isPending}>Previous</Button>
                <Button type="submit" className="md:min-w-30" disabled={isPending}>
                    {isPending ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </form>
    );
}