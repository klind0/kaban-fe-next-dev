"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IListing } from "@/types/listingTypes";
import { Location } from "@/components/icons/location";

type Tab = "video" | "map";

function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
      if (parts[0] === "shorts" && parts[1]) {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function PropertyMediaTabs({ listing }: { listing: IListing }) {
  const videoUrl =
    (listing as any)?.video || (listing as any)?.video_url || "";
  const embedUrl = useMemo(
    () => (videoUrl ? toEmbedUrl(String(videoUrl)) : null),
    [videoUrl],
  );
  const hasVideo = Boolean(embedUrl || videoUrl);

  const [tab, setTab] = useState<Tab>(hasVideo ? "video" : "map");

  // Google Maps State & Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const circleInstance = useRef<any>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { coordinates, landmark, address, city, state } =
    listing?.location || {};

  // GeoJSON / MongoDB coordinates order is [longitude, latitude]
  const rawLng = coordinates?.[0];
  const rawLat = coordinates?.[1];
  const initialLat =
    typeof rawLat === "number" && rawLat !== 0 ? rawLat : 5.0154;
  const initialLng =
    typeof rawLng === "number" && rawLng !== 0 ? rawLng : 7.9173;

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  // 1. Dynamically load Google Maps JS API script
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

  // 2. Geocoder fallback if raw coordinates are absent
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
      const searchQuery = [landmark, address, city, state]
        .filter(Boolean)
        .join(", ");
      if (!searchQuery) return;
      const geocoder = new globalWin.google.maps.Geocoder();
      geocoder.geocode(
        { address: searchQuery },
        (results: any, status: string) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            setMapCenter({ lat: loc.lat(), lng: loc.lng() });
          }
        },
      );
    }
  }, [isMapLoaded, rawLat, rawLng, landmark, address, city, state]);

  // 3. Initialize/Update Map & Privacy Circle when on the 'map' tab
  useEffect(() => {
    const globalWin = window as any;
    if (
      tab !== "map" ||
      !isMapLoaded ||
      !mapRef.current ||
      !globalWin.google?.maps
    )
      return;

    if (!googleMapInstance.current) {
      googleMapInstance.current = new globalWin.google.maps.Map(
        mapRef.current,
        {
          center: mapCenter,
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        },
      );
    } else {
      googleMapInstance.current.setCenter(mapCenter);
      // Trigger resize event to ensure full coverage when container expands
      globalWin.google.maps.event.trigger(
        googleMapInstance.current,
        "resize",
      );
    }

    if (circleInstance.current) {
      circleInstance.current.setMap(null);
    }

    // 600-meter translucent privacy perimeter
    circleInstance.current = new globalWin.google.maps.Circle({
      map: googleMapInstance.current,
      center: mapCenter,
      radius: 600,
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
  }, [tab, isMapLoaded, mapCenter]);

  return (
    <section className="mt-8 px-4 md:px-0">
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-6 px-4 pt-3 border-b border-neutral-100">
          {hasVideo && (
            <button
              type="button"
              onClick={() => setTab("video")}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === "video"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-foreground"
              }`}
            >
              Video
            </button>
          )}
          <button
            type="button"
            onClick={() => setTab("map")}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === "map"
                ? "border-primary text-primary"
                : "border-transparent text-neutral-600 hover:text-foreground"
            }`}
          >
            Location &amp; Neighborhood Boundary
          </button>
        </div>

        {/* Tab Body View */}
        <div className="p-3 md:p-4">
          {tab === "video" && hasVideo ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-100">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Property video"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <a
                  href={String(videoUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center text-primary font-medium underline"
                >
                  Open property video
                </a>
              )}
            </div>
          ) : (
            <div className="relative w-full h-[400px] md:h-[480px] rounded-lg overflow-hidden bg-neutral-100">
              {/* Google Map Container */}
              <div ref={mapRef} className="w-full h-full" />

              {/* Neighborhood Overlay Info Card */}
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
                  {listing?.cover_image && (
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
                      <div className="text-xs text-neutral-900 font-medium leading-tight">
                        Near {landmark}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy Notice Badge */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur text-xs font-medium text-neutral-900 px-3 py-2 rounded-lg shadow-md border border-neutral-200 pointer-events-none z-10 max-w-[280px]">
                🔒 To ensure resident security, exact street coordinates are hidden behind this localized perimeter radius.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}