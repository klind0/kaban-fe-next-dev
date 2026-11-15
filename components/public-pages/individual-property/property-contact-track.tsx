"use client";

import { trackMetaEventWithCapi } from "@/lib/meta-pixel";
import { axiosInstance } from "@/network/axios-instance";

type Props = {
  listingId: string;
  listingTitle?: string;
  method: "whatsapp" | "call" | "email";
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
};

export default function PropertyContactTrack({
  listingId,
  listingTitle,
  method,
  href,
  children,
  className,
  target,
  rel,
}: Props) {
  const onClick = () => {
    const apiBaseUrl = axiosInstance.defaults.baseURL?.replace(/\/+$/, "");
    if (!apiBaseUrl) {
      console.error("Unable to log realtor contact: API base URL is missing.");
    } else {
      void fetch(
        `${apiBaseUrl}/listings/${encodeURIComponent(listingId)}/contact-log`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactType: method }),
          keepalive: true,
        },
      ).then((response) => {
        if (!response.ok) {
          console.error(
            `Unable to log realtor contact (request failed with status ${response.status}).`,
          );
        }
      }).catch((error: unknown) => {
        console.error("Unable to log realtor contact.", error);
      });
    }

    void trackMetaEventWithCapi({
      eventName: "Contact",
      params: {
        content_ids: [listingId],
        content_name: listingTitle,
        content_type: "product",
        // custom detail for Ads Manager
        contact_method: method,
      },
    });
  };

  return (
    <a href={href} target={target} rel={rel} className={className} onClick={onClick}>
      {children}
    </a>
  );
}