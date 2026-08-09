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
    const details = listing?.details;
    const features = details?.features || [];
    const hasDescription = Boolean(listing?.description?.trim());
    const hasFeatures = features.length > 0;

    // Check if at least one basic numeric detail metric exists
    const hasBasicDetails = Boolean(
        details?.bedroom ||
        details?.bathroom ||
        details?.toilet ||
        details?.parking_space ||
        details?.land_area
    );

    return (
        <div className="space-y-8 px-4 md:px-0">
            {/* Top Property Details Card - Always rendered to ensure Property ID is permanently visible */}
            <div className="border border-neutral-600 rounded-[10px] mt-8 shadow">
                <div className={`p-4 flex items-center justify-between text-foreground flex-wrap font-semibold ${hasBasicDetails ? "border-b border-neutral-600" : ""}`}>
                    <h5>Property Details</h5>
                    {listing?.property_id && <h5>ID: {listing.property_id}</h5>}
                </div>

                {/* Render metrics body section only if at least one metric is present */}
                {hasBasicDetails && (
                    <div className="p-4 flex flex-col md:flex-row gap-4 flex-wrap items-start md:items-center justify-start md:gap-8">
                        {Boolean(details?.bedroom) && (
                            <div className="flex items-center gap-1.5">
                                <Bed className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base font-medium">
                                    {details.bedroom} Bedroom{details.bedroom! > 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                        {Boolean(details?.bathroom) && (
                            <div className="flex items-center gap-1.5">
                                <Shoerline className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base font-medium">
                                    {details.bathroom} Bathroom{details.bathroom! > 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                        {Boolean(details?.toilet) && (
                            <div className="flex items-center gap-1.5">
                                <Toilet className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base font-medium">
                                    {details.toilet} Toilet{details.toilet! > 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                        {Boolean(details?.parking_space) && (
                            <div className="flex items-center gap-1.5">
                                <Car className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base font-medium">
                                    {details.parking_space} Parking Spot{details.parking_space! > 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                        {Boolean(details?.land_area) && (
                            <div className="flex items-center gap-1.5">
                                <FormatSquare className="size-4 md:size-5 text-primary" />
                                <span className="text-sm md:text-base font-medium">
                                    {details.land_area} m²
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description & Features Card - Only rendered if at least one exists */}
            {(hasDescription || hasFeatures) && (
                <div className="border border-neutral-600 rounded-[10px] shadow">
                    {/* Description Section */}
                    {hasDescription && (
                        <div className="p-4">
                            <div className="flex items-center justify-between text-foreground font-semibold">
                                <h5>Description</h5>
                            </div>
                            <div className="pt-3 text-neutral-900 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                <p>{listing.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Features Section - Rendered only if features array is non-empty */}
                    {hasFeatures && (
                        <div className={`px-4 py-4 ${hasDescription ? "border-t border-neutral-600" : ""}`}>
                            <h5 className="text-foreground font-semibold mb-3">Features</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Checkbox 
                                            checked={true} 
                                            disabled
                                            className="data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=checked]:border-primary" 
                                        />
                                        <span className="text-sm font-medium capitalize text-neutral-800">
                                            {feature.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}