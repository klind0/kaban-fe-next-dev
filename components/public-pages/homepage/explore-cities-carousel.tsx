"use client";

import Carousel from "@/components/universal/carousel";
import React from "react";

export default function ExploreCitiesCarousel({
  children,
}: {
  children: React.ReactNode[];
}) {
  return <Carousel>{children}</Carousel>;
}
