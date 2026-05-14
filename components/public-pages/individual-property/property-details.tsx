import { Bed } from "@/components/icons/bed";
import { Car } from "@/components/icons/car";
import { FormatSquare } from "@/components/icons/format-square";
import { Shoerline } from "@/components/icons/shoerline";
import { Toilet } from "@/components/icons/toilet";
import { Checkbox } from "@/components/ui/checkbox";
import { IListing } from "@/types/listingTypes";

interface PropertyDetailsProps {
    listing: IListing;
}
export default function PropertyDetails({ listing }: PropertyDetailsProps) {
    return (
        <div className="space-y-8 px-4 md:px-0">
            <div className="border border-neutral-600 rounded-[10px] mt-8 shadow">
                <div className="p-4 flex items-center justify-between text-foreground flex-wrap font-semibold border-b border-neutral-600">
                    <h5>Property Details</h5>
                    <h5>ID: {listing?.property_id}</h5>
                </div>
                <div className="p-4 flex flex-col md:flex-row gap-3 flex-wrap items-start md:items-center justify-between">
                    {
                        listing?.details?.bedroom && (
                            <div className="flex items-center gap-1">
                                <Bed className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base">{listing.details.bedroom} Bedroom{listing.details.bedroom > 1 ? "s" : ""}</span>
                            </div>
                        )
                    }
                    {
                        listing?.details?.bathroom && (
                            <div className="flex items-center gap-1">
                                <Shoerline className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base">{listing.details.bathroom} Bathroom{listing.details.bathroom > 1 ? "s" : ""}</span>
                            </div>
                        )
                    }
                    {
                        listing?.details?.toilet && (
                            <div className="flex items-center gap-1">
                                <Toilet className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base">{listing.details.toilet} Toilet{listing.details.toilet > 1 ? "s" : ""}</span>
                            </div>
                        )
                    }
                    {
                        listing?.details?.parking_space && (
                            <div className="flex items-center gap-1">
                                <Car className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base">{listing.details.parking_space} Parking Spot{listing.details.parking_space > 1 ? "s" : ""}</span>
                            </div>
                        )
                    }
                    {
                        listing?.details?.land_area && (
                            <div className="flex items-center gap-1">
                                <FormatSquare className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base">{listing.details.land_area} m²</span>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="border border-neutral-600 rounded-[10px] mt-8 shadow">
                <div className="p-4">
                    <div className="flex items-center justify-between text-foreground font-semibold">
                        <h5>Description</h5>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 flex-wrap items-start md:items-center justify-between pt-4">
                        <p>{listing?.description}</p>
                    </div>
                </div>
                <div>
                    <div className="border-t border-neutral-600 px-4 py-4">
                        <h5 className="text-foreground">Features</h5>
                        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('swimming pool')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>Swimming Pool</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('garden')} className="data-[state=checked]:bg-white data-[state=checked]:text-gray-50 data-[state=checked]:border-gray-50" />
                                <span>Garden</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('en-suite')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>En-suite</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('boys quarters')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>Boys Quarters</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('gym')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>Gym</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('CCTV')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>CCTV Cameras</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('security post')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>Security Post</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('24hr power')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>24hr Power</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox checked={listing?.details?.features.includes('interlocked compound')} className="data-[state=checked]:bg-white data-[state=checked]:text-foreground data-[state=checked]:border-foreground" />
                                <span>Interlocked Compound</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
