"use client";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { useState } from "react";
import { Location } from "@/components/icons/location";
import { IListing } from "@/types/listingTypes";
import Image from "next/image";
import "mapbox-gl/dist/mapbox-gl.css";

interface PropertyMapProps {
    listing: IListing;
}

export default function PropertyMapView({ listing }: PropertyMapProps) {
    const { coordinates, address } = listing.location;
    const [popupOpen, setPopupOpen] = useState(false);

    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    return (
        <div className="mt-8 px-4 md:px-0">
            <div className="border border-neutral-600 rounded-[10px] shadow overflow-hidden">
                <div className="p-4 flex items-center justify-between text-foreground font-semibold border-b border-neutral-600">
                    <h5>Map and street view</h5>
                </div>
                <div className="w-full h-110.75 sm:py-4 sm:px-4">
                    <Map
                        mapboxAccessToken={mapboxAccessToken}
                        initialViewState={{
                            longitude: coordinates[1],
                            latitude: coordinates[0],
                            zoom: 15,
                        }}
                        style={{ height: "100%", width: "100%" }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        scrollZoom={false}
                    >
                        <NavigationControl position="top-right" />

                        <Marker
                            longitude={coordinates[1]}
                            latitude={coordinates[0]}
                            anchor="top"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setPopupOpen(true);
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <Location className="text-red-500 w-8 h-8 drop-shadow" />
                        </Marker>

                        {popupOpen && (
                            <Popup
                                longitude={coordinates[1]}
                                latitude={coordinates[0]}
                                onClose={() => setPopupOpen(false)}
                                closeOnClick={true}
                                closeButton={false}
                                maxWidth="240px"
                                className="property-popup rounded-2xl"
                            >
                                <div className="overflow-hidden shadow-md bg-none">
                                    {listing.cover_image && (
                                        <div className="relative w-full h-32">
                                            <Image
                                                src={listing.cover_image}
                                                alt="Property"
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        </div>
                                    )}
                                    {address && (
                                        <div className="flex items-start gap-1.5 px-3 py-2.5">
                                            <Location className="text-primary shrink-0 mt-0.5 size-4" />
                                            <div className="text-sm">{address}</div>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        )}
                    </Map>
                </div>
            </div>
        </div>
    );
}