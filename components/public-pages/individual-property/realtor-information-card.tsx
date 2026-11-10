import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listingTypes";
import RealtorAvatar from "@/components/shared/realtor-avatar";
import { Call } from "@/components/icons/call";
import { Whatsapp } from "@/components/icons/whatsapp";
import { buildWhatsAppLink, propertyInquiryMessage } from "@/lib/whatsapp";
import PropertyContactTrack from "@/components/public-pages/individual-property/property-contact-track";

interface RealtorInformationCardProps {
  listing: IListing;
}

export default function RealtorInformationCard({
  listing,
}: RealtorInformationCardProps) {
  const listingId = String(
    listing?.id || (listing as { _id?: string })?._id || "",
  );

  const realtorName = listing?.realtor?.full_name || "Listing Agent";
  const avatarUrl = listing?.realtor?.realtor_pic || null;

  const whatsappPhone =
    listing?.realtor?.whatsapp_number || listing?.realtor?.mobile_number || "";

  const whatsappHref = whatsappPhone
    ? buildWhatsAppLink(
        whatsappPhone,
        propertyInquiryMessage({
          title: listing?.title,
          property_id: listing?.property_id,
        }),
      )
    : null;

  return (
    <div className="border border-neutral-600 rounded-[10px] shadow">
      <div className="p-4 flex items-center justify-between text-foreground flex-wrap font-semibold border-b border-neutral-600">
        <h5>Listing Realtor</h5>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <RealtorAvatar
            src={avatarUrl}
            alt={realtorName}
            size={48}
            isFoundingRealtor={Boolean(listing?.realtor?.is_founding_realtor)}
            fallbackText={(realtorName.trim().match(/\b\w/g) || ["R"])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
            fallbackClassName="bg-primary text-white font-bold text-base"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-foreground font-bold truncate">{realtorName}</h4>
            {listing?.realtor?.email && (
              <p className="text-sm text-neutral-900 truncate mt-0.5">
                {listing.realtor.email}
              </p>
            )}
          </div>
        </div>

        {/*
        <div className="space-y-3 text-sm">
          ...
        </div>
        */}

        <div className="flex items-center gap-4">
          {whatsappHref && listingId && (
            <PropertyContactTrack
              listingId={listingId}
              listingTitle={listing?.title}
              method="whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full text-primary border-primary gap-2"
              >
                <Whatsapp className="size-5" />
                WhatsApp
              </Button>
            </PropertyContactTrack>
          )}

          {listing?.realtor?.mobile_number && listingId && (
            <PropertyContactTrack
              listingId={listingId}
              listingTitle={listing?.title}
              method="call"
              href={`tel:${listing.realtor.mobile_number}`}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full text-primary border-primary gap-2"
              >
                <Call className="size-5" />
                Call
              </Button>
            </PropertyContactTrack>
          )}
        </div>
      </div>

      {/*
      <div className="border-t border-neutral-600 p-4">
        ...
      </div>
      */}
    </div>
  );
}