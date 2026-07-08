import { Heart } from "../icons/heart"
import { Camera } from "../icons/camera"
import { Location } from "../icons/location"
import { Bed } from "../icons/bed"
import { Shoerline } from "../icons/shoerline"
import { Car } from "../icons/car"
import Image from "next/image"
import Link from "next/link"
import { Skeleton } from "../ui/skeleton"
import { cn } from "@/lib/utils"
import { IListing } from "@/types/listingTypes"
import { formatPrice } from "@/lib/formatPrice"
import React from "react"
import { generateListingSlug } from "@/lib/manageSlug"
import { toTitleCase } from "@/utils/formatText"

interface ListingCardProps {
    listingData: IListing;
}

const listingTypeConfig = {
    sale: { label: "For sale" },
    rent: { label: "For rent" },
    shortlet: { label: "Shortlet" },
};

export default function ListingCard({
    listingData,
}: ListingCardProps) {
    const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (!listingData) return null;
    const { title, property_type, price, details, images, cover_image, location, isFeatured, realtor, status } = listingData;
    const listing = listingTypeConfig[status];
    const imageUrl = cover_image || images?.[0]?.url;
    const photoCount = images?.length ?? 0;

    const daysAgo = Math.floor((Date.now() - new Date(listingData.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const daysLabel = daysAgo <= 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

    const beds = details?.bedroom ?? 0;
    const baths = details?.bathroom ?? 0;
    const parkingSpots = details?.parking_space ?? 0;

    // 🛠 Construct a clean string checking if city/state properties are provided explicitly
    const buildFullLocationString = () => {
        if (!location) return "";
        
        // If address already includes commas, it might already be a fully concatenated string
        if (location.address && location.address.includes(",")) {
            return location.address;
        }

        const parts = [location.address, location.city, location.state].filter(Boolean);
        return parts.join(", ");
    };

    const propertyLocation = buildFullLocationString();

    return (
        <Link href={`/property/${generateListingSlug(listingData)}`} className='group block w-full max-w-134.5 rounded-[10px] shadow overflow-hidden cursor-pointer duration-300'>
            <div className='h-74.75 overflow-hidden relative'>
                <div className='h-full transition-transform duration-500 ease-in group-hover:scale-105' style={{ background: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
                <div className="absolute inset-0 bg-[#00000038] w-full h-full flex flex-col justify-between p-4">
                    <div className="flex justify-between items-center">
                        <div className="bg-[#00000066] p-2 rounded-lg text-white text-xs font-semibold" style={{ backdropFilter: 'blur(25px)' }}>
                            {daysLabel}
                        </div>
                        <button onClick={(e) => { e.preventDefault(); toggleFavorite(listingData.id); }} aria-label={favorites.has(listingData.id) ? 'Remove from favorites' : 'Add to favorites'}><Heart filled={favorites.has(listingData.id)} /></button>
                    </div>
                    <div className="flex items-center gap-1"><Camera /><span className="text-white text-sm font-semibold">{photoCount}</span></div>
                </div>
            </div>
            <div className="bg-white p-4 w-full">
                <div className="space-y-3">
                    <div className="space-y-2">
                        {/* 🛠 Transformed property type toTitleCase as well */}
                        <span className="text-xs font-semibold text-neutral-500 capitalize">{toTitleCase(property_type || '')}</span>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#272D37] whitespace-nowrap">{formatPrice(price?.amount)}</h3>
                            <div className="flex items-center gap-2">
                                {listing && <div className="bg-[#006AFF]/10 text-primary text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2">● {listing.label}</div>}
                                {isFeatured && <div className={`bg-[#41AE49]/10 text-[#41AE49] text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2`}>● Featured</div>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex">
                            <span className="text-sm font-medium truncate">{toTitleCase(title || '')}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <Location className="text-primary flex-shrink-0" />
                            <span className="text-sm font-medium truncate text-neutral-600" title={toTitleCase(propertyLocation)}>
                                {toTitleCase(propertyLocation)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                        <div className="flex items-center gap-1">
                            <Bed className="text-primary" />
                            <span className="text-xs font-medium">{beds} Bed{beds !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Shoerline className="text-primary" />
                            <span className="text-xs font-medium">{baths} Bath{baths !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Car className="text-primary" />
                            <span className="text-xs font-medium">{parkingSpots} Parking spot{parkingSpots !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-neutral-50 p-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                    {realtor?.realtor_pic ? (
                        <div className="size-8 rounded-full overflow-hidden">
                            <Image src={realtor.realtor_pic} width={32} height={32} alt="Realtor profile image" />
                        </div>
                    ) : (
                        <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                            R
                        </div>
                    )}
                    {realtor?.mobile_number && <span className="text-sm font-medium text-neutral-700">{realtor.mobile_number}</span>}
                </div>
            </div>
        </Link>
    )
}

export function ListingCardSkeleton({ props, className }: { props?: React.ComponentProps<"div">, className?: string }) {
    return (
        <Skeleton className={cn("w-full max-w-134.5 rounded-[10px] h-133", className)} {...props} />
    )
}