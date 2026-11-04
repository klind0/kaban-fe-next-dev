import { cn } from "@/lib/utils";
import ExploreCitiesCarousel from "@/components/public-pages/homepage/explore-cities-carousel";
import Image from "next/image";
import Link from "next/link";
import PortharcourtImg from "@/app/assets/images/port-harcourt-city.webp";
import AsabaImg from "@/app/assets/images/asaba-city.webp";
import CalabarImg from "@/app/assets/images/calabar-city.webp";
import UyoImg from "@/app/assets/images/uyo-city.webp";

interface CityCardProps {
    name: string;
    description: string;
    className?: string;
}

const cities = [
    { name: "Port Harcourt", description: "Treasure base", bgImg: PortharcourtImg },
    { name: "Asaba", description: "The Big Heart", bgImg: AsabaImg },
    { name: "Calabar", description: "The Nation's paradise", bgImg: CalabarImg },
    { name: "Uyo", description: "Land of Promise", bgImg: UyoImg },
];

export default function ExploreCitiesSection() {
    return (
        <section className="bg-[#F0F0F0]">
            {/* Desktop layout */}
            <div className="hidden lg:flex gap-8 container mx-auto py-8 px-4 2xl:px-0 md:py-16 items-stretch">
                <div className="w-full grid gap-8">
                    <div className="flex items-center justify-center">
                        <Title />
                    </div>
                    <CityCard name="Port Harcourt" description="Treasure base" className="h-full" />
                </div>
                <CityCard name="Asaba" description="The Big Heart" className="md:h-180" />
                <div className="w-full flex flex-col gap-8">
                    <CityCard name="Calabar" description="The Nation's paradise" className="flex-1" />
                    <CityCard name="Uyo" description="Land of Promise" className="flex-1" />
                </div>
            </div>

            {/* Mobile carousel */}
            <div className="lg:hidden py-8 px-4">
                <div className="mb-8">
                    <Title />
                </div>
                <ExploreCitiesCarousel>
                    {cities.map((city) => (
                        <CityCard key={city.name} name={city.name} description={city.description} />
                    ))}
                </ExploreCitiesCarousel>
            </div>
        </section>
    );
}

function CityCard({ name, description, className }: CityCardProps) {
    const city = cities.find((item) => item.name === name);

    return (
        <Link
            href={`/search?location=${encodeURIComponent(name)}`}
            className={cn(
                "relative block w-full h-full min-h-65 bg-gray-50 rounded-3xl overflow-hidden",
                className
            )}
        >
            {city && (
                <Image
                    src={city.bgImg}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                />
            )}
            <div className="relative z-10 bg-[#00000073] flex items-center justify-center size-full">
                <div className="flex flex-col items-center justify-center text-white">
                    <h4 className="text-2xl md:text-[36px] text-center font-semibold">{name}</h4>
                    <span className="text-center md:text-xl">{description}</span>
                </div>
            </div>
        </Link>
    );
}

function Title() {
    return (
        <div>
            <h3 className="text-2xl text-center  lg:text-left md:text-[36px] text-primary font-bold">Explore Cities</h3>
            <span className="md:text-xl block text-center lg:text-left">
                Have a look at listings located at some of the amazing cities in Nigeria.
            </span>
        </div>
    );
}
