"use client";

import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { Location } from "@/components/icons/location";
import { IListing } from "@/types/listingTypes";
import Image from "next/image";

interface PropertyMapProps {
    listing: IListing;
}

// 🌐 Custom Helper component to render native Google Maps Circle
function MapCircle({
    center,
    radius,
    onClick,
}: {
    center: { lat: number; lng: number };
    radius: number;
    onClick: () => void;
}) {
    const map = useMap();
    const circleRef = useRef<google.maps.Circle | null>(null);

    useEffect(() => {
        if (!map) return;

        // Initialize Google Maps Circle
        const circle = new google.maps.Circle({
            map,
            center,
            radius, // Radius in meters
            fillColor: "#006AFF",
            fillOpacity: 0.15,
            strokeColor: "#006AFF",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: true,
        });

        circle.addListener("click", onClick);
        circleRef.current = circle;

        return () => {
            circle.setMap(null);
        };
    }, [map, center, radius, onClick]);

    return null;
}

export default function PropertyMapView({ listing }: PropertyMapProps) {
    const { coordinates, landmark } = listing.location;
    const [popupOpen, setPopupOpen] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    // Coordinates configuration: [lat, lng]
    const latitude = coordinates?.[0] ?? 6.5244;
    const longitude = coordinates?.[1] ?? 3.3792;
    const center = { lat: latitude, lng: longitude };

    return (
        <div className="mt-8 px-4 md:px-0">
            <div className="border border-neutral-600 rounded-[10px] shadow overflow-hidden">
                <div className="p-4 flex items-center justify-between text-foreground font-semibold border-b border-neutral-600">
                    <h5>Location & Neighborhood Boundary</h5>
                </div>
                <div className="w-full h-110.75 sm:p-4 relative">
                    <APIProvider apiKey={apiKey}>
                        <Map
                            defaultCenter={center}
                            defaultZoom={14}
                            gestureHandling="cooperative"
                            disableDefaultUI={false}
                            zoomControl={true}
                            style={{ width: "100%", height: "100%" }}
                            className="rounded-lg overflow-hidden"
                        >
                            {/* Translucent Perimeter Privacy Circle (600m radius) */}
                            <MapCircle 
                                center={center} 
                                radius={600} 
                                onClick={() => setPopupOpen(true)} 
                            />

                            {/* Interactive Area Context InfoWindow */}
                            {popupOpen && (
                                <InfoWindow 
                                    position={center} 
                                    onCloseClick={() => setPopupOpen(false)}
                                >
                                    <div className="overflow-hidden max-w-[240px]">
                                        {listing.cover_image && (
                                            <div className="relative w-full h-28 rounded-t-lg overflow-hidden mb-2">
                                                <Image
                                                    src={listing.cover_image}
                                                    alt="Property Area"
                                                    fill
                                                    className="object-cover"
                                                    sizes="240px"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-1 p-1">
                                            <span className="text-[10px] font-bold text-primary tracking-wide uppercase">
                                                Approximate Location
                                            </span>
                                            {landmark && (
                                                <div className="flex items-start gap-1.5 mt-0.5">
                                                    <Location className="text-neutral-500 shrink-0 size-3.5 mt-0.5" />
                                                    <div className="text-xs text-neutral-700 font-medium leading-tight">
                                                        Near {landmark}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </InfoWindow>
                            )}
                        </Map>
                    </APIProvider>

                    {/* Informative Security Notice */}
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur text-xs font-medium text-neutral-900 px-3 py-2 rounded-lg shadow-sm border pointer-events-none z-10 max-w-[280px]">
                        🔒 To ensure resident security, the exact street coordinates are hidden behind this localized perimeter radius.
                    </div>
                </div>
            </div>
        </div>
    );
}