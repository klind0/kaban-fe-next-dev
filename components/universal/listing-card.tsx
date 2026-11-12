import { Heart } from "../icons/heart"
import { Camera } from "../icons/camera"
import { Location } from "../icons/location"
import { Bed } from "../icons/bed"
import { Toilet } from "../icons/toilet"
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
import { getListingCoverUrl } from "@/lib/listingCover";
import RealtorAvatar from "@/components/shared/realtor-avatar"

interface ListingCardProps {
    listingData: IListing;
}

const listingTypeConfig = {
    sale: { label: "Sale" },
    rent: { label: "Rent" },
    shortlet: { label: "Shortlet" },
};

const resolveListingImageUrl = (data: IListing): string | undefined => {
  const imgs = data.images ?? [];
  const urls = imgs
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter((u): u is string => Boolean(u));

  // Prefer explicit cover only if it is one of the listing images
  if (data.cover_image && urls.includes(data.cover_image)) {
    return data.cover_image;
  }

  // Otherwise first image (MediaForm often puts the selected cover at index 0)
  if (urls[0]) return urls[0];

  // Last resort
  return data.cover_image || undefined;
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
    const imageUrl = getListingCoverUrl(listingData);
    const photoCount = images?.length ?? 0;

    const publishDate = listingData.publishedAt || listingData.createdAt;
    const daysAgo = Math.floor((Date.now() - new Date(publishDate).getTime()) / (1000 * 60 * 60 * 24));
    const daysLabel = daysAgo <= 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

    const beds = details?.bedroom ?? 0;
    const toilets = details?.toilet || details?.bathroom || 0;
    const parkingSpots = details?.parking_space ?? 0;

    // 🛠️ Dynamic Realtor Profile Resolution & Founding Realtor Flag
    const realtorName = realtor?.full_name || "Listing Agent";
    const avatarUrl = realtor?.realtor_pic || null;
    const initials = (realtorName.trim().match(/\b\w/g) || ["R"])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const isFoundingRealtor = Boolean(realtor?.is_founding_realtor);

    // 🛠️ Construct a clean string checking if city/state properties are provided explicitly
    const buildFullLocationString = () => {
        if (!location) return "";
        
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
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={title || "Property listing"}
                        fill
                        unoptimized
                        loading="lazy"
                        sizes="(min-width: 768px) 540px, 100vw"
                        className="object-cover transition-transform duration-500 ease-in group-hover:scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-[#00000038] w-full h-full flex flex-col justify-between p-4">
                    <div className="flex justify-between items-center">
                        <div className="bg-[#00000066] p-2 rounded-lg text-white text-xs font-semibold" style={{ backdropFilter: 'blur(25px)' }}>
                            {daysLabel}
                        </div>
                        <button onClick={(e) => { e.preventDefault(); toggleFavorite(listingData.id); }} aria-label={favorites.has(listingData.id) ? 'Remove from favorites' : 'Add to favorites'}>
                            <Heart filled={favorites.has(listingData.id)} />
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        <Camera />
                        <span className="text-white text-sm font-semibold">{photoCount}</span>
                    </div>
                </div>
            </div>
            <div className="bg-white p-4 w-full">
                <div className="space-y-3">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold text-neutral-900 capitalize">{toTitleCase(property_type || '')}</span>
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
                            <span className="text-lg truncate text-primary font-semibold">{toTitleCase(title || '')}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <Location className="text-primary flex-shrink-0" />
                            <span className="text-sm font-medium truncate text-neutral-900" title={toTitleCase(propertyLocation)}>
                                {toTitleCase(propertyLocation)}
                            </span>
                        </div>
                    </div>
                    {(beds > 0 || toilets > 0 || parkingSpots > 0) && (
                        <div className="flex items-center gap-4 pt-1">
                            {beds > 0 && (
                                <div className="flex items-center gap-1">
                                    <Bed className="text-primary" />
                                    <span className="text-xs font-medium">{beds} Bed{beds !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {toilets > 0 && (
                                <div className="flex items-center gap-1">
                                    <Toilet className="text-primary" />
                                    <span className="text-xs font-medium">{toilets} Toilet{toilets !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {parkingSpots > 0 && (
                                <div className="flex items-center gap-1">
                                    <Car className="text-primary" />
                                    <span className="text-xs font-medium">{parkingSpots} Parking spot{parkingSpots !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 🛠️ Footer: Realtor Profile with Founding Realtor Avatar Component */}
            <div className="bg-neutral-50 p-4 border-t border-neutral-100">
                <div className="flex items-center gap-3 min-w-0">
                    <RealtorAvatar
                        src={avatarUrl}
                        alt={realtorName}
                        size={32}
                        isFoundingRealtor={isFoundingRealtor}
                    />
                    <span className="text-sm font-medium text-neutral-900 truncate">
                        {realtorName}
                    </span>
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