"use client";

import Map, { Source, Layer, Popup, NavigationControl } from "react-map-gl/mapbox";
import { useState, useMemo } from "react";
import { Location } from "@/components/icons/location";
import { IListing } from "@/types/listingTypes";
import Image from "next/image";
import "mapbox-gl/dist/mapbox-gl.css";

interface PropertyMapProps {
    listing: IListing;
}

// 🌐 Pure mathematical helper mapping a standard closed polygon tracking array to render circles over Mapbox
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

export default function PropertyMapView({ listing }: PropertyMapProps) {
    const { coordinates, landmark } = listing.location;
    const [popupOpen, setPopupOpen] = useState(false);
    const [cursor, setCursor] = useState<string>("auto");

    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Safety fallback coords configuration mapping backend spec: [lat, lng]
    const latitude = coordinates?.[0] ?? 6.5244;
    const longitude = coordinates?.[1] ?? 3.3792;

    // Build the GeoJSON data representation targeting the 600m perimeter coverage boundary
    const circleGeoJson = useMemo(() => {
        return createGeoJsonCircle([longitude, latitude], 0.6);
    }, [latitude, longitude]);

    return (
        <div className="mt-8 px-4 md:px-0">
            <div className="border border-neutral-600 rounded-[10px] shadow overflow-hidden">
                <div className="p-4 flex items-center justify-between text-foreground font-semibold border-b border-neutral-600">
                    <h5>Location & Neighborhood Boundary</h5>
                </div>
                <div className="w-full h-110.75 sm:py-4 sm:px-4 relative">
                    <Map
                        mapboxAccessToken={mapboxAccessToken}
                        initialViewState={{
                            longitude: longitude,
                            latitude: latitude,
                            zoom: 13.5,
                        }}
                        style={{ height: "100%", width: "100%" }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        scrollZoom={false}
                        interactiveLayerIds={["privacy-circle-fill"]}
                        cursor={cursor}
                        onMouseEnter={() => setCursor("pointer")}
                        onMouseLeave={() => setCursor("auto")}
                        onClick={(e) => {
                            if (e.features && e.features.length > 0) {
                                setPopupOpen(true);
                            }
                        }}
                    >
                        <NavigationControl position="top-right" />

                        {/* Translucent Perimeter Circle replacing the exact Pin Marker */}
                        <Source id="public-privacy-source" type="geojson" data={circleGeoJson}>
                            <Layer
                                id="privacy-circle-fill"
                                type="fill"
                                paint={{
                                    "fill-color": "#006AFF",
                                    "fill-opacity": 0.15,
                                }}
                            />
                            <Layer
                                id="privacy-circle-outline"
                                type="line"
                                paint={{
                                    "line-color": "#006AFF",
                                    "line-width": 2,
                                    "line-dasharray": [2, 2],
                                }}
                            />
                        </Source>

                        {/* Interactive Area Context Popup */}
                        {popupOpen && (
                            <Popup
                                longitude={longitude}
                                latitude={latitude}
                                onClose={() => setPopupOpen(false)}
                                closeOnClick={true}
                                closeButton={true}
                                maxWidth="260px"
                                className="property-popup rounded-2xl"
                            >
                                <div className="overflow-hidden bg-none">
                                    {listing.cover_image && (
                                        <div className="relative w-full h-32 rounded-t-lg overflow-hidden">
                                            <Image
                                                src={listing.cover_image}
                                                alt="Property Area"
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1 px-3 py-2.5">
                                        <span className="text-[10px] font-bold text-primary tracking-wide uppercase">Approximate Location</span>
                                        {landmark && (
                                            <div className="flex items-start gap-1.5">
                                                <Location className="text-neutral-500 shrink-0 mt-0.5 size-4" />
                                                <div className="text-xs text-neutral-700 font-medium leading-tight">
                                                    Near {landmark}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Map>

                    {/* Informative Public Notice floating element */}
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur text-xs font-medium text-neutral-700 px-3 py-2 rounded-lg shadow-sm border pointer-events-none z-10 max-w-[280px]">
                        🔒 To ensure resident security, the exact street coordinates are hidden behind this localized perimeter radius.
                    </div>
                </div>
            </div>
        </div>
    );
}