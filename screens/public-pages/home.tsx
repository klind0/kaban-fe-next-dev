import HeroBg from "@/app/assets/images/hero-bg.webp";
import ExploreCitiesSection from "@/components/public-pages/homepage/explore-cities-section";
import HeroSection from "@/components/public-pages/homepage/hero-section";
import PropertyTypesSection from "@/components/public-pages/homepage/property-types-section";
import Image from "next/image";
import React from "react";

type HomeScreenProps = {
  featuredSection: React.ReactNode;
  latestSection: React.ReactNode;
};

export default function HomeScreen({
  featuredSection,
  latestSection,
}: HomeScreenProps) {
  return (
    <div className="relative isolate min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Image
          src={HeroBg}
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <React.Suspense
        fallback={
          <section className="min-h-screen flex items-center justify-center bg-[#00000051] mt-18">
            <div className="container mx-auto space-y-8 px-4 md:px-20 md:space-y-16">
              <div>
                <p className="h2 text-center text-white">
                  Discover your customized fit with ease
                </p>
                <h1 className="text-center text-white">
                  Smartest way to find real estate
                </h1>
              </div>
              <div
                aria-hidden="true"
                className="h-65 animate-pulse rounded-3xl border border-border bg-card shadow-lg sm:h-50"
              />
            </div>
          </section>
        }
      >
        <HeroSection />
      </React.Suspense>
      {featuredSection}
      <PropertyTypesSection />
      <ExploreCitiesSection />
      {latestSection}
    </div>
  );
}