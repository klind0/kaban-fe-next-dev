"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { trackMetaEventWithCapi } from "@/lib/meta-pixel";

export default function SearchMetaTracker() {
  const searchParams = useSearchParams();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const q =
      searchParams.get("q") ||
      searchParams.get("search") ||
      searchParams.get("query") ||
      "";
    const status = searchParams.get("status") || "";
    const state = searchParams.get("state") || "";
    const city = searchParams.get("city") || "";

    const searchString = [q, status, state, city].filter(Boolean).join(" | ");
    if (!searchString.trim()) return;

    const key = searchParams.toString();
    if (lastKey.current === key) return;
    lastKey.current = key;

    void trackMetaEventWithCapi({
      eventName: "Search",
      params: {
        search_string: searchString.slice(0, 100),
        content_category: status || undefined,
      },
    });
  }, [searchParams]);

  return null;
}