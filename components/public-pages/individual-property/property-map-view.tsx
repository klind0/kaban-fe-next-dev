"use client";

import { useState, useEffect, useRef } from "react";
import { Location } from "@/components/icons/location";
import { IListing } from "@/types/listingTypes";
import Image from "next/image";

interface PropertyMapProps {
    listing: IListing;
}

export default function PropertyMapView({ listing }: PropertyMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const circleInstance = useRef<any>(null);

    const [popupOpen, setPopupOpen] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const { coordinates, landmark, address, city, state } = listing.location || {};

    // 🛠️ GeoJSON / MongoDB coordinates order is [longitude, latitude]
    const rawLng = coordinates?.[0];
    const rawLat = coordinates?.[1];

    const initialLat = typeof rawLat === "number" && rawLat !== 0 ? rawLat : 5.0154;
    const initialLng = typeof rawLng === "number" && rawLng !== 0 ? rawLng : 7.9173;

    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
        lat: initialLat,
        lng: initialLng,
    });

    // 1. Dynamically load Google Maps JS API script with Places/Geocoding libraries
    useEffect(() => {
        if (!apiKey) return;

        const globalWin = window as any;

        if (globalWin.google?.maps) {
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
            if (globalWin.google?.maps) setIsMapLoaded(true);
        }
    }, [apiKey]);

    // 2. Fallback Geocoder if raw coordinates are missing
    useEffect(() => {
        const globalWin = window as any;
        if (!isMapLoaded || !globalWin.google?.maps) return;

        const hasValidCoords =
            typeof rawLat === "number" &&
            typeof rawLng === "number" &&
            (rawLat !== 0 || rawLng !== 0);

        if (hasValidCoords) {
            setMapCenter({ lat: rawLat, lng: rawLng });
        } else {
            // Geocode using Landmark / Address / City / State
            const searchQuery = [landmark, address, city, state].filter(Boolean).join(", ");
            if (!searchQuery) return;

            const geocoder = new globalWin.google.maps.Geocoder();
            geocoder.geocode({ address: searchQuery }, (results: any, status: string) => {
                if (status === "OK" && results?.[0]?.geometry?.location) {
                    const loc = results[0].geometry.location;
                    setMapCenter({ lat: loc.lat(), lng: loc.lng() });
                }
            });
        }
    }, [isMapLoaded, rawLat, rawLng, landmark, address, city, state]);

    // 3. Initialize / Update Map & 600m Privacy Radius Circle
    useEffect(() => {
        const globalWin = window as any;
        if (!isMapLoaded || !mapRef.current || !globalWin.google?.maps) return;

        if (!googleMapInstance.current) {
            googleMapInstance.current = new globalWin.google.maps.Map(mapRef.current, {
                center: mapCenter,
                zoom: 14,
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            });
        } else {
            googleMapInstance.current.setCenter(mapCenter);
        }

        // Clean up previous circle if centered position updates
        if (circleInstance.current) {
            circleInstance.current.setMap(null);
        }

        // Create 600-meter translucent privacy perimeter circle around landmark
        circleInstance.current = new globalWin.google.maps.Circle({
            map: googleMapInstance.current,
            center: mapCenter,
            radius: 600, // radius in meters
            fillColor: "#006AFF",
            fillOpacity: 0.15,
            strokeColor: "#006AFF",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: true,
        });

        circleInstance.current.addListener("click", () => {
            setPopupOpen(true);
        });

        return () => {
            if (circleInstance.current) {
                circleInstance.current.setMap(null);
            }
        };
    }, [isMapLoaded, mapCenter]);

    return (
        <div className="mt-8 px-4 md:px-0">
            <div className="border border-neutral-600 rounded-[10px] shadow overflow-hidden">
                <div className="p-4 flex items-center justify-between text-foreground font-semibold border-b border-neutral-600">
                    <h5>Location & Neighborhood Boundary</h5>
                </div>

                <div className="w-full h-110.75 sm:p-4 relative">
                    {/* Google Map Canvas */}
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

                    {/* Resident Security Notice */}
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur text-xs font-medium text-neutral-900 px-3 py-2 rounded-lg shadow-sm border pointer-events-none z-10 max-w-[280px]">
                        🔒 To ensure resident security, the exact street coordinates are hidden behind this localized perimeter radius.
                    </div>
                </div>
            </div>
        </div>
    );
}