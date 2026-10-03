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
import PropertyMediaTabs from "@/components/public-pages/individual-property/property-media-tabs";
import RealtorInformationCard from "@/components/public-pages/individual-property/realtor-information-card";
import SafetyTipCard from "@/components/public-pages/individual-property/safety-tip-card";
import DisclaimerCard from "@/components/public-pages/individual-property/disclaimer-card";
import SimilarProperties from "@/components/public-pages/individual-property/similar-properties";
import Image from "next/image";
import { Call } from "@/components/icons/call";
import { Whatsapp } from "@/components/icons/whatsapp";
import { Sms } from "@/components/icons/sms";
import { buildWhatsAppLink, propertyInquiryMessage } from "@/lib/whatsapp";
import PropertyViewContentTracker from "@/components/public-pages/individual-property/property-view-content-tracker";
import PropertyContactTrack from "@/components/public-pages/individual-property/property-contact-track";

interface IndividualPropertyProps {
  slug: string;
  initialData?: IListing | null;
}

const toTitleCase = (str: string = ""): string => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function IndividualProperty({
  slug,
  initialData,
}: IndividualPropertyProps) {
  const listing = initialData ?? null;

  const priceLabel =
    listing?.price?.per === "one-time"
      ? formatPrice(listing?.price?.amount ?? 0)
      : `${formatPrice(listing?.price?.amount ?? 0)}/${
          listing?.price?.per ?? "annum"
        }`;

  if (!listing) {
    return (
      <div className="container mx-auto mt-24 px-4 py-12 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 bg-neutral-200 rounded w-48" />
          <div className="h-4 bg-neutral-200 rounded w-32" />
        </div>
      </div>
    );
  }

  const listingId = String(
    listing.id || (listing as { _id?: string })._id || "",
  );

  const realtorName = listing?.realtor?.full_name || "Listing Agent";
  const avatarUrl = listing?.realtor?.realtor_pic || null;

  const initials = (realtorName.trim().match(/\b\w/g) || ["R"])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formattedLocation = [
    listing?.location?.address,
    listing?.location?.city,
    listing?.location?.state,
  ]
    .filter(Boolean)
    .map((part) => toTitleCase(part?.toString().trim()))
    .join(", ");

  const formattedTitle = toTitleCase(listing?.title || "");

  const whatsappPhone =
    listing?.realtor?.whatsapp_number || listing?.realtor?.mobile_number || "";

  const whatsappHref = whatsappPhone
    ? buildWhatsAppLink(
        whatsappPhone,
        propertyInquiryMessage({
          title: listing.title,
          property_id: listing.property_id,
        }),
      )
    : null;

  const contactBtnClass =
    "text-primary border-primary size-9 p-0 flex items-center justify-center rounded-full hover:bg-primary/5";

  return (
    <div className="container mx-auto mt-18 pb-28 md:pb-12">
      {/* Meta ViewContent (Pixel + CAPI) — once listing is ready */}
      <PropertyViewContentTracker listing={listing} />

      {/* Header Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          asChild
          variant="outline"
          className="rounded-full size-10 p-0 flex items-center justify-center"
        >
          <Link href="/" aria-label="Go back to home page">
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        {/*
                <div className="flex items-center gap-4">
                    <button className="rounded-full p-2 hover:bg-neutral-100 transition-colors" title="Share listing">
                        <Share />
                    </button>
                    <button className="rounded-full p-2 hover:bg-neutral-100 transition-colors" title="Report listing">
                        <Warning />
                    </button>
                </div>
                */}
      </div>

      {/* Main Content Layout */}
      <div className="mt-4 flex flex-col lg:flex-row gap-8">
        {/* Left Column - Property Media & Details */}
        <div className="w-full lg:w-[65%]">
          {listing && <PropertyImages listing={listing} />}

          {/* Basic Property Information */}
          <div className="mt-8 px-4 md:px-0">
            <div className="space-y-3">
              <h5 className="text-foreground text-lg font-medium capitalize">
                {listing?.property_type
                  ? listing.property_type.replace(/_/g, " ")
                  : "Property"}
              </h5>
              <div className="flex items-center gap-2">
                {listing?.status && (
                  <div className="bg-[#006AFF]/10 text-primary text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2 capitalize">
                    ● For {listing.status}
                  </div>
                )}
                {listing?.isFeatured && (
                  <div className="bg-[#41AE49]/10 text-[#41AE49] text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2">
                    ● Featured
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row justify-between items-start lg:items-center">
              <div>
                <h3 className="text-lg md:text-3xl font-semibold text-foreground capitalize">
                  {formattedTitle}
                </h3>
                {formattedLocation && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Location className="text-primary shrink-0 size-5" />
                    <span className="font-medium text-neutral-900 text-sm md:text-base capitalize">
                      {formattedLocation}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-lg md:text-3xl font-bold text-foreground shrink-0">
                  {priceLabel}
                </h4>
              </div>
            </div>
          </div>

          {listing && <PropertyDetails listing={listing} />}

          {listing && <PropertyMediaTabs listing={listing} />}
        </div>

        {/* Right Column - Realtor Card & Safety Info */}
        <div className="w-full lg:w-[35%] px-4 md:px-0">
          <div className="space-y-8 sticky top-20">
            <RealtorInformationCard listing={listing} />
            <SafetyTipCard />
            <DisclaimerCard />

            <div className="bg-neutral-200 border border-neutral-300 rounded-lg flex items-center justify-center h-80 font-bold text-neutral-500 text-lg">
              Advert Space
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Similar Properties Section */}
      <div className="mt-12">
        <SimilarProperties currentListing={listing} />
      </div>

      {/* Mobile Quick-Contact Bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 left-0 right-0 z-40 bg-white p-3 border-t border-neutral-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto flex justify-between items-center px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-10 rounded-full overflow-hidden shrink-0 bg-primary flex items-center justify-center text-white text-xs font-bold">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  width={40}
                  height={40}
                  alt="Realtor avatar"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-foreground text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px]">
                {realtorName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {listing?.realtor?.mobile_number && listingId && (
              <PropertyContactTrack
                listingId={listingId}
                listingTitle={listing.title}
                method="call"
                href={`tel:${listing.realtor.mobile_number}`}
              >
                <Button variant="outline" className={contactBtnClass}>
                  <Call className="size-4" />
                </Button>
              </PropertyContactTrack>
            )}
            {whatsappHref && listingId && (
              <PropertyContactTrack
                listingId={listingId}
                listingTitle={listing.title}
                method="whatsapp"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className={contactBtnClass}>
                  <Whatsapp className="size-4" />
                </Button>
              </PropertyContactTrack>
            )}
            {listing?.realtor?.email && listingId && (
              <PropertyContactTrack
                listingId={listingId}
                listingTitle={listing.title}
                method="email"
                href={`mailto:${listing.realtor.email}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className={contactBtnClass}>
                  <Sms className="size-4" />
                </Button>
              </PropertyContactTrack>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}