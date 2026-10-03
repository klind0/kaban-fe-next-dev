"use client";

import { useEffect, useRef } from "react";
import { IListing } from "@/types/listingTypes";
import { trackMetaEventWithCapi } from "@/lib/meta-pixel";

type Props = {
  listing: IListing;
};

export default function PropertyViewContentTracker({ listing }: Props) {
  const sentForId = useRef<string | null>(null);

  useEffect(() => {
    const id = listing?.id || (listing as any)?._id;
    if (!id) return;
    if (sentForId.current === String(id)) return;
    sentForId.current = String(id);

    void trackMetaEventWithCapi({
      eventName: "ViewContent",
      params: {
        content_name: listing.title || undefined,
        content_ids: [String(id)],
        content_type: "product",
        content_category: listing.property_category || undefined,
        value: listing.price?.amount,
        currency: "NGN",
      },
    });
  }, [listing]);

  return null;
}