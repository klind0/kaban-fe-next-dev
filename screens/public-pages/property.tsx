    import Share from "@/components/icons/share";
import Warning from "@/components/icons/warning";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { IListing } from "@/types/listingTypes";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import PropertyImages from "@/components/public-pages/individual-property/property-images";
import { Location } from "@/components/icons/location";
import PropertyDetails from "@/components/public-pages/individual-property/property-details";
import PropertyMapView from "@/components/public-pages/individual-property/property-map-view";
import RealtorInformationCard from "@/components/public-pages/individual-property/realtor-information-card";
import SafetyTipCard from "@/components/public-pages/individual-property/safety-tip-card";
import DisclaimerCard from "@/components/public-pages/individual-property/disclaimer-card";
import SimilarProperties from "@/components/public-pages/individual-property/similar-properties";
import Image from "next/image";
import DefaultAvatar from "@/app/assets/images/sample-avatar.png";
import { Call } from '@/components/icons/call';
import { Whatsapp } from '@/components/icons/whatsapp';
import { Sms } from '@/components/icons/sms';

interface IndividualPropertyProps {
    slug: string;
    initialData?: IListing | null;
}

export default function IndividualProperty({ slug, initialData }: IndividualPropertyProps) {
    const listing = initialData ?? null;

    const priceLabel = listing?.price?.per === "one-time"
        ? formatPrice(listing?.price?.amount ?? 0)
        : `${formatPrice(listing?.price?.amount ?? 0)}/${listing?.price?.per ?? "annum"}`;

    console.log("slug:", slug)


    if (!listing) {
        return (
            //Update this to a proper loading skeleton later
            <div>Loading property details</div>
        );
    }

    return (
        <div className="container mx-auto mt-18">
            <div className="flex items-center justify-between px-4 py-3">
                <Button asChild variant="outline" className="rounded-full size-10">
                    <Link href="/" aria-label="Go back to home page">
                        <ChevronLeft className="size-5" />
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                    <button className="rounded-full" title="Share listing"><Share /></button>
                    <button className="rounded-full" title="Report listing"><Warning /></button>
                </div>
            </div>

            <div className="mt-6 flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-[65%]">
                    {listing && <PropertyImages listing={listing} />}

                    {/* Basic Property info */}
                    <div className="mt-8 px-4 md:px-0">
                        <div className="space-y-3">
                            <h5 className="text-foreground text-lg font-medium">Apartment</h5>
                            <div className="flex items-center gap-2">
                                {listing && <div className="bg-[#006AFF]/10 text-primary text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2">● For {listing.status}</div>}
                                {listing?.isFeatured && <div className={`bg-[#41AE49]/10 text-[#41AE49] text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2`}>● Featured</div>}
                            </div>
                        </div>
                        <div className="mt-5 flex flex-col gap-4 lg:flex-row justify-between">
                            <div>
                                <h3 className="text-lg md:text-3xl font-semibold text-foreground">{listing?.title}</h3>
                                <div className="flex items-center gap-1">
                                    <Location className="text-primary" />
                                    <span className="font-medium">{listing?.location?.address}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg md:text-3xl font-bold text-foreground">{priceLabel}</h4>
                            </div>
                        </div>

                    </div>
                    {listing && <PropertyDetails listing={listing} />}
                    <PropertyMapView listing={listing} />
                </div>

                <div className="w-full lg:w-[35%] px-4 md:px-0">
                    <div className="space-y-8 sticky top-18">
                        <RealtorInformationCard listing={listing} />
                        <SafetyTipCard />
                        <DisclaimerCard />
                        <div className="bg-neutral-400 flex items-center justify-center h-100.5 font-bold text-primary text-lg">
                            Advert space
                        </div>
                    </div>
                </div>
            </div>
            <SimilarProperties />

            {/* Mobile bottom bar - visible only on small screens */}
            <div className="md:hidden fixed inset-x-0 w-full bottom-0 z-40 bg-background p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className='flex items-center gap-2'>
                        <div className="size-8 rounded-full overflow-hidden shrink-0">
                            <Image src={listing.realtor.realtor_pic ?? DefaultAvatar} width={32} height={32} alt="Realtor avatar" className="object-cover" />
                        </div>
                        <div>
                            <h4 className='text-foreground text-sm font-semibold'>{"Realtor's Name"}</h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {listing?.realtor?.mobile_number && (

                            <Link href={`tel:${listing?.realtor?.mobile_number}`} className='font-medium '>
                                <Button variant="outline" className="w-full text-primary border-primary size-8">
                                    <Call className='size-4' />
                                </Button>
                            </Link>
                        )}
                        {listing?.realtor?.whatsapp_number && (
                            <Link
                                href={`https://wa.me/${listing.realtor.whatsapp_number.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <Button variant="outline" className="w-full text-primary border-primary size-8">
                                    <Whatsapp className='size-4' />
                                </Button>
                            </Link>
                        )}
                        <Link
                            href={`mailto:${listing.realtor.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button variant="outline" className="w-full text-primary border-primary size-8">
                                <Sms className='size-4' />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
