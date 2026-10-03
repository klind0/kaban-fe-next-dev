"use client";

import { trackMetaEventWithCapi } from "@/lib/meta-pixel";

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