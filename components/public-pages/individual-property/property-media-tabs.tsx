"use client";

import { useMemo, useState } from "react";
import { IListing } from "@/types/listingTypes";
import PropertyMapView from "@/components/public-pages/individual-property/property-map-view";

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
    (listing as any)?.video ||
    (listing as any)?.video_url ||
    "";

  const embedUrl = useMemo(
    () => (videoUrl ? toEmbedUrl(String(videoUrl)) : null),
    [videoUrl],
  );

  const hasVideo = Boolean(embedUrl || videoUrl);
  const [tab, setTab] = useState<Tab>(hasVideo ? "video" : "map");

  return (
    <section className="mt-8 px-4 md:px-0">
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
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
            Map and street view
          </button>
        </div>

        <div className="p-3 md:p-4">
          {tab === "video" && hasVideo ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-200">
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
            <div className="relative w-full min-h-[240px] aspect-video rounded-lg overflow-hidden bg-neutral-200">
              <PropertyMapView listing={listing} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}