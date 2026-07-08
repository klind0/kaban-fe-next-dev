"use client";

import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { IListing } from "@/types/listingTypes";
import { Controller, useForm, useWatch } from "react-hook-form";
import FormCard from "./form-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Map, { MapRef, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LocationListingData } from "@/network/listings";
import { nigeriaCitiesByState, nigerianStates } from "@/lib/selectOptions";
import React from "react";
import Script from "next/script";

type LocationFormValues = {
    location: IListing["location"];
    agreement: boolean;
};

type LandmarkAutocompleteProps = {
    value: string;
    onChange: (value: string) => void;
    onSelect: (landmarkName: string, lng: number, lat: number) => void;
    error?: string;
    onBlur?: () => void;
};

// Global string formatting utility for pristine rendering
const toTitleCase = (str: string): string => {
    if (!str) return "";
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

function LandmarkAutocomplete({ value, onChange, onSelect, error, onBlur }: LandmarkAutocompleteProps) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const autocompleteRef = React.useRef<any>(null);
    const [inputValue, setInputValue] = React.useState(value || "");
    const [scriptLoaded, setScriptLoaded] = React.useState(false);

    React.useEffect(() => {
        if (value !== undefined) {
            setInputValue(toTitleCase(value));
        }
    }, [value]);

    // Polling/Interval fallback check to capture Google if it loads late
    React.useEffect(() => {
        const checkGoogle = () => {
            const googleObject = (window as any).google;
            if (googleObject?.maps?.places) {
                setScriptLoaded(true);
                clearInterval(interval);
            }
        };
        const interval = setInterval(checkGoogle, 500);
        checkGoogle();
        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        if (typeof window !== "undefined" && inputRef.current && scriptLoaded) {
            const googleObject = (window as any).google;
            if (!googleObject?.maps?.places) return;

            if (!autocompleteRef.current) {
                autocompleteRef.current = new googleObject.maps.places.Autocomplete(inputRef.current, {
                    componentRestrictions: { country: "ng" },
                    fields: ["name", "geometry"],
                });

                autocompleteRef.current.addListener("place_changed", () => {
                    const place = autocompleteRef.current?.getPlace();
                    if (!place || !place.geometry || !place.geometry.location) return;

                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const landmarkName = toTitleCase(place.name || "");

                    setInputValue(landmarkName);
                    onChange(landmarkName);
                    onSelect(landmarkName, lng, lat);
                });
            }
        }
    }, [scriptLoaded, onChange, onSelect]);

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-baseline">
                <div className="w-full flex justify-between">
                    <label className="text-foreground text-sm font-medium">Nearest Landmark *</label>
                </div>
                {error && (
                    <span className="text-[#B02817] text-xs sm:text-sm whitespace-nowrap bg-red-50 px-2 py-0.5 rounded">{error}</span>
                )}
            </div>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                    const formatted = toTitleCase(e.target.value);
                    setInputValue(formatted);
                    onChange(formatted);
                }}
                onBlur={onBlur}
                placeholder="Search closest hotel, bank, fuel station, plaza..."
                className={`${error ? 'border-[#B02817] ring-1 ring-[#B02817]/20' : 'border-neutral-700'} border rounded-sm h-11 outline-none p-3 text-base w-full font-medium bg-[#F9FBFF] focus:ring-2 focus:ring-primary/20 focus:border-primary`}
            />
            <p className="text-[11px] text-neutral-800 mt-0.5">
                Type to choose a nearby public location.
            </p>
        </div>
    );
}

const createGeoJsonCircle = (center: [number, number], radiusInKm: number, points: number = 64): any => {
    const [lng, lat] = center;
    const coordinatesList: [number, number][] = [];
    const distanceX = radiusInKm / (111.32 * Math.cos((lat * Math.PI) / 180));
    const distanceY = radiusInKm / 110.57;

    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coordinatesList.push([lng + x, lat + y]);
    }
    coordinatesList.push(coordinatesList[0]);

    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [coordinatesList],
        },
    };
};

type Props = {
    onFormSubmit: (data: LocationListingData, submit: boolean) => Promise<void>;
    isPending: boolean;
    onBack: () => void;
    externalErrors?: any; 
};

export default function LocationForm({ onFormSubmit, isPending, onBack, externalErrors }: Props) {
    const addressBlockRef = React.useRef<HTMLDivElement>(null);
    const stateBlockRef = React.useRef<HTMLDivElement>(null);
    const cityBlockRef = React.useRef<HTMLDivElement>(null);
    const agreementBlockRef = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<MapRef>(null);

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
                coordinates: [5.0377, 7.9128], 
            },
            agreement: false,
        },
        mode: "onChange",
    });

    const coordinates = useWatch({ control, name: "location.coordinates" });
    const selectedState = useWatch({ control, name: "location.state" });
    
    const latitude = coordinates?.[0] ?? 6.5244;
    const longitude = coordinates?.[1] ?? 3.3792;

    const cityOptions = selectedState ? (nigeriaCitiesByState[selectedState] ?? []) : [];

    const circleGeoJson = React.useMemo(() => {
        return createGeoJsonCircle([longitude, latitude], 0.6);
    }, [latitude, longitude]);

    const onSubmit = (data: LocationFormValues) => {
        // Strict normalization transforms applied to values before backend communication layers execute
        const normalizedData: LocationListingData = {
            location: {
                ...data.location,
                address: toTitleCase(data.location.address),
                landmark: toTitleCase(data.location.landmark),
            }
        };
        onFormSubmit(normalizedData, true);
    };

    const onFormError = (formErrors: typeof errors) => {
        if (formErrors.location?.address) {
            addressBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (formErrors.location?.state) {
            stateBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (formErrors.location?.city) {
            cityBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (formErrors.agreement) {
            agreementBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    return (
        <div>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                strategy="lazyOnload" 
            />

            <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-4 md:space-y-7.5 mt-8">
                <FormCard title="Location">
                    <div className="space-y-6">
                        <div ref={addressBlockRef} className="w-full scroll-mt-24">
                            <Controller
                                name="location.address"
                                control={control}
                                rules={{ required: "Street name address location is required" }}
                                render={({ field }) => (
                                    <FormControl
                                        as="input"
                                        labelText="Street Address *"
                                        placeholder="e.g. 14, Bassey Way"
                                        type="text"
                                        containerClass="w-full"
                                        value={toTitleCase(field.value || "")}
                                        onChange={(e: any) => field.onChange(toTitleCase(e.target.value))}
                                        onBlur={field.onBlur}
                                        error={getErrorMessage(externalErrors?.location?.address || errors.location?.address)}
                                    />
                                )}
                            />
                        </div>

                        <div className="w-full flex flex-col md:flex-row gap-6">
                            <div ref={stateBlockRef} className="w-full scroll-mt-24">
                                <Controller
                                    name="location.state"
                                    control={control}
                                    rules={{ required: "State selection is required" }}
                                    render={({ field }) => (
                                        <FormControl
                                            as="select"
                                            labelText="State *"
                                            placeholder="Select state"
                                            containerClass="w-full"
                                            options={nigerianStates}
                                            value={field.value}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                setValue("location.city", "", { shouldValidate: true });
                                            }}
                                            error={getErrorMessage(externalErrors?.location?.state || errors.location?.state)}
                                        />
                                    )}
                                />
                            </div>

                            <div ref={cityBlockRef} className="w-full scroll-mt-24">
                                <Controller
                                    name="location.city"
                                    control={control}
                                    rules={{ required: "City selection is required" }}
                                    render={({ field }) => (
                                        <FormControl
                                            as="select"
                                            labelText="City *"
                                            placeholder={selectedState ? "Select city" : "Select a state first"}
                                            containerClass="w-full"
                                            options={cityOptions}
                                            disabled={!selectedState}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={getErrorMessage(externalErrors?.location?.city || errors.location?.city)}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </FormCard>

                <FormCard title="Map Viewport">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/2 rounded-lg overflow-hidden min-h-60 relative border border-neutral-200">
                            <Map
                                key={`${latitude}-${longitude}`}
                                ref={mapRef}
                                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                                initialViewState={{
                                    longitude: longitude,
                                    latitude: latitude,
                                    zoom: 13,
                                }}
                                style={{ width: "100%", height: "100%", minHeight: "260px" }}
                                mapStyle="mapbox://styles/mapbox/streets-v12"
                                scrollZoom={false}
                            >
                                <NavigationControl position="top-right" />
                                <Source id="privacy-circle-source" type="geojson" data={circleGeoJson}>
                                    <Layer
                                        id="privacy-circle-fill"
                                        type="fill"
                                        paint={{ "fill-color": "#006AFF", "fill-opacity": 0.18 }}
                                    />
                                    <Layer
                                        id="privacy-circle-outline"
                                        type="line"
                                        paint={{ "line-color": "#006AFF", "line-width": 2, "line-dasharray": [2, 2] }}
                                    />
                                </Source>
                            </Map>
                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-[10px] font-bold text-neutral-900 px-2 py-1 rounded shadow border pointer-events-none z-10">
                                🔒 Exact property location hidden behind a neighborhood radius
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 space-y-5">
                            <Controller
                                name="location.landmark"
                                control={control}
                                rules={{ required: "A nearby target landmark identification is required" }}
                                render={({ field }) => (
                                    <LandmarkAutocomplete
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        onSelect={(landmarkName, lng, lat) => {
                                            setValue("location.landmark", landmarkName, { shouldValidate: true, shouldDirty: true });
                                            setValue("location.coordinates", [lat, lng], { shouldValidate: true });
                                            mapRef.current?.flyTo({ center: [lng, lat], zoom: 13.5, duration: 1200 });
                                        }}
                                        error={getErrorMessage(externalErrors?.location?.landmark || errors.location?.landmark)}
                                    />
                                )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <FormControl
                                    as="input"
                                    labelText="Longitude"
                                    type="number"
                                    disabled
                                    containerClass="w-full opacity-60"
                                    value={longitude}
                                />
                                <FormControl
                                    as="input"
                                    labelText="Latitude"
                                    type="number"
                                    disabled
                                    containerClass="w-full opacity-60"
                                    value={latitude}
                                />
                            </div>
                        </div>
                    </div>
                </FormCard>

                {/* Agreement block */}
                <div ref={agreementBlockRef} className="p-4 md:p-8 space-y-4 rounded-[10px] border border-neutral-600 scroll-mt-24">
                    <div className="flex items-center justify-between">
                        <h3 className="text-black text-2xl font-semibold">Agreement <span className="text-[#B02817]">*</span></h3>
                        {(externalErrors?.agreement || errors.agreement) && (
                            <span className="text-[#B02817] text-xs sm:text-sm whitespace-nowrap bg-red-50 px-2 py-0.5 rounded">This field is required</span>
                        )}
                    </div>
                    <Controller
                        name="agreement"
                        control={control}
                        rules={{ required: "You must check the agreement consent box to continue" }}
                        render={({ field }) => (
                            <label className="flex items-start gap-3 cursor-pointer">
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className={`mt-0.5 ${errors.agreement ? 'border-[#B02817] ring-1 ring-[#B02817]/20' : ''}`}
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
        </div>
    );
}