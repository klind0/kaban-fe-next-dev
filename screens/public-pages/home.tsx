import HeroBg from "@/app/assets/images/hero-bg.webp"
import ExploreCitiesSection from "@/components/public-pages/homepage/explore-cities-section"
import FeaturedListingSection from "@/components/public-pages/homepage/featured-listing-section"
import HeroSection from "@/components/public-pages/homepage/hero-section"
import LatestAddition from "@/components/public-pages/homepage/latest-addition"
import PropertyTypesSection from "@/components/public-pages/homepage/property-types-section"

export default function HomeScreen() {
    return (
        <div className="min-h-screen overflow-auto bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${HeroBg.src})` }}>
            <HeroSection />
            <FeaturedListingSection />
            <PropertyTypesSection />
            <ExploreCitiesSection />
            <LatestAddition />
        </div>
    )
}
