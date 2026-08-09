"use client";

import { useState, useEffect, useRef } from "react";
import { Location } from "@/components/icons/location";
import { IListing } from "@/types/listingTypes";
import Image from "next/image";

interface PropertyMapProps {
    listing: IListing;
}

declare global {
    interface Window {
        google?: any;
    }
}

export default function PropertyMapView({ listing }: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [popupOpen, setPopupOpen] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    // Coordinates configuration: [lat, lng]
    const { coordinates, landmark } = listing.location;
    const latitude = coordinates?.[0] ?? 6.5244;
    const longitude = coordinates?.[1] ?? 3.3792;

    // 1. Dynamically load Google Maps JS API script with zero external dependencies
    useEffect(() => {
        if (!apiKey) return;

        if (window.google?.maps) {
            setIsMapLoaded(true);
            return;
        }

        const scriptId = "google-maps-js-sdk";
        const existingScript = document.getElementById(scriptId);

        if (!existingScript) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsMapLoaded(true);
            document.head.appendChild(script);
        } else {
            existingScript.addEventListener("load", () => setIsMapLoaded(true));
            if (window.google?.maps) setIsMapLoaded(true);
        }
    }, [apiKey]);

    // 2. Initialize Google Map instance and 600m Privacy Radius Circle
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current || !window.google?.maps) return;

        const center = { lat: latitude, lng: longitude };

        const map = new window.google.maps.Map(mapRef.current, {
            center,
            zoom: 14,
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        });

        // 600-meter translucent privacy perimeter circle
        const circle = new window.google.maps.Circle({
            map,
            center,
            radius: 600, // in meters
            fillColor: "#006AFF",
            fillOpacity: 0.15,
            strokeColor: "#006AFF",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: true,
        });

        // Open area context card on circle click
        circle.addListener("click", () => {
            setPopupOpen(true);
        });

        return () => {
            circle.setMap(null);
        };
    }, [isMapLoaded, latitude, longitude]);

    return (
        <div className="mt-8 px-4 md:px-0">
            <div className="border border-neutral-600 rounded-[10px] shadow overflow-hidden">
                <div className="p-4 flex items-center justify-between text-foreground font-semibold border-b border-neutral-600">
                    <h5>Location & Neighborhood Boundary</h5>
                </div>

                <div className="w-full h-110.75 sm:p-4 relative">
                    {/* Google Map Canvas Container */}
                    <div 
                        ref={mapRef} 
                        className="w-full h-full rounded-lg overflow-hidden bg-neutral-100" 
                    />

                    {/* Interactive Neighborhood Overlay Info Card */}
                    {popupOpen && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-neutral-200 p-3 z-20 w-64 max-w-[90%] transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-primary tracking-wide uppercase">
                                    Approximate Location
                                </span>
                                <button
                                    onClick={() => setPopupOpen(false)}
                                    className="text-neutral-400 hover:text-neutral-700 text-xs font-bold px-1"
                                    aria-label="Close popup"
                                >
                                    ✕
                                </button>
                            </div>

                            {listing.cover_image && (
                                <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2">
                                    <Image
                                        src={listing.cover_image}
                                        alt="Property Area"
                                        fill
                                        className="object-cover"
                                        sizes="240px"
                                    />
                                </div>
                            )}

                            {landmark && (
                                <div className="flex items-start gap-1.5 pt-1">
                                    <Location className="text-neutral-500 shrink-0 size-4 mt-0.5" />
                                    <div className="text-xs text-neutral-700 font-medium leading-tight">
                                        Near {landmark}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Informative Resident Security Badge */}
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur text-xs font-medium text-neutral-700 px-3 py-2 rounded-lg shadow-sm border pointer-events-none z-10 max-w-[280px]">
                        🔒 To ensure resident security, the exact street coordinates are hidden behind this localized perimeter radius.
                    </div>
                </div>
            </div>
        </div>
    );
}