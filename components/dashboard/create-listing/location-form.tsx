// components/dashboard/create-listing/location-form.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import LandmarkAutocomplete from "./landmark-autocomplete";
import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { IListing } from "@/types/listingTypes";
import FormCard from "./form-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationListingData } from "@/network/listings";
import { nigeriaCitiesByState, nigerianStates } from "@/lib/selectOptions";
import Script from "next/script";

type LocationFormValues = {
    location: IListing["location"];
    agreement: boolean;
};

const toTitleCase = (str: string): string => {
    if (!str) return "";
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

type Props = {
    onFormSubmit: (data: LocationListingData, submit: boolean) => Promise<void>;
    isPending: boolean;
    onBack: () => void;
    externalErrors?: any;
};

export default function LocationForm({ onFormSubmit, isPending, onBack, externalErrors }: Props) {
    const addressBlockRef = useRef<HTMLDivElement>(null);
    const stateBlockRef = useRef<HTMLDivElement>(null);
    const cityBlockRef = useRef<HTMLDivElement>(null);
    const agreementBlockRef = useRef<HTMLDivElement>(null);
    
    // Google Maps References
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const circleInstanceRef = useRef<any>(null);

    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Diagnostics validation loop
    useEffect(() => {
        const checkGoogle = () => {
            const googleObject = (window as any).google;
            if (googleObject?.maps?.places) {
                console.log("✅ Diagnostic: Google Maps Places library fully injected into window.");
                setScriptLoaded(true);
                clearInterval(interval);
            }
        };
        const interval = setInterval(checkGoogle, 500);
        checkGoogle();
        return () => clearInterval(interval);
    }, []);

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
                coordinates: [5.0377, 7.9128], // Default to Akwa Ibom/Uyo region
            },
            agreement: false,
        },
        mode: "onChange",
    });

    const coordinates = useWatch({ control, name: "location.coordinates" });
    const selectedState = useWatch({ control, name: "location.state" });

    const latitude = coordinates?.[0] ?? 5.0377;
    const longitude = coordinates?.[1] ?? 7.9128;

    const cityOptions = selectedState ? (nigeriaCitiesByState[selectedState] ?? []) : [];

    // Sync state changes with native Google Map instances
    useEffect(() => {
        if (!scriptLoaded || !mapContainerRef.current) return;

        const targetCenter = { lat: latitude, lng: longitude };

        // Initialize map view frame if not already active
        if (!mapInstanceRef.current) {
            const g = (window as any).google;
            mapInstanceRef.current = new g.maps.Map(mapContainerRef.current, {
                center: targetCenter,
                zoom: 14,
                disableDefaultUI: true,
                zoomControl: true,
                gestureHandling: "cooperative",
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });
        }

        // Draw or dynamically translate the visual privacy overlay zone (600m)
        if (circleInstanceRef.current) {
            circleInstanceRef.current.setCenter(targetCenter);
        } else {
            const g = (window as any).google;
            circleInstanceRef.current = new g.maps.Circle({
                map: mapInstanceRef.current,
                center: targetCenter,
                radius: 600, 
                strokeColor: "#006AFF",
                strokeOpacity: 0.7,
                weight: 1.5,
                fillColor: "#006AFF",
                fillOpacity: 0.12,
            });
        }
    }, [scriptLoaded, latitude, longitude]);

    const onSubmit = (data: LocationFormValues) => {
        const normalizedData: LocationListingData = {
            location: {
                ...data.location,
                address: toTitleCase(data.location.address),
                landmark: toTitleCase(data.location.landmark),
            },
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
                id="google-maps-script"
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
                strategy="afterInteractive"
                onLoad={() => {
                    console.log("Script tag onload event triggered.");
                    setScriptLoaded(true);
                }}
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
                                        value={field.value || ""}
                                        onChange={(e: any) => field.onChange(e.target.value)}
                                        onBlur={() => field.onChange(toTitleCase(field.value || ""))}
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
                            <div 
                                ref={mapContainerRef} 
                                style={{ width: "100%", height: "100%", minHeight: "260px" }}
                            />
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
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        scriptLoaded={scriptLoaded}
                                        onSelect={(landmarkName, lng, lat) => {
                                            setValue("location.landmark", landmarkName, { shouldValidate: true, shouldDirty: true });
                                            setValue("location.coordinates", [lat, lng], { shouldValidate: true });
                                            
                                            if (mapInstanceRef.current) {
                                                mapInstanceRef.current.panTo({ lat, lng });
                                                mapInstanceRef.current.setZoom(14.5);
                                            }
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
