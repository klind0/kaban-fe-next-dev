import HeroBg from "@/app/assets/images/hero-bg.webp";
import ExploreCitiesSection from "@/components/public-pages/homepage/explore-cities-section";
import FeaturedListingSection from "@/components/public-pages/homepage/featured-listing-section";
import HeroSection from "@/components/public-pages/homepage/hero-section";
import LatestAddition from "@/components/public-pages/homepage/latest-addition";
import PropertyTypesSection from "@/components/public-pages/homepage/property-types-section";
import { IListing } from "@/types/listingTypes";

type HomeScreenProps = {
  initialFeatured?: IListing[];
  initialLatest?: IListing[];
};

export default function HomeScreen({
  initialFeatured = [],
  initialLatest = [],
}: HomeScreenProps) {
  return (
    <div
      className="min-h-screen overflow-auto bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${HeroBg.src})` }}
    >
      <HeroSection />
      <FeaturedListingSection initialListings={initialFeatured} />
      <PropertyTypesSection />
      <ExploreCitiesSection />
      <LatestAddition initialListings={initialLatest} />
    </div>
  );
}