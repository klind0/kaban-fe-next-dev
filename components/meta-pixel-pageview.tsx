"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function MetaPixelPageviewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixelPageview() {
  return (
    <Suspense fallback={null}>
      <MetaPixelPageviewInner />
    </Suspense>
  );
}