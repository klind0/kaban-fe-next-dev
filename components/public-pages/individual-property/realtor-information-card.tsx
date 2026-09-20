import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listingTypes";
import Image from "next/image";
import Link from "next/link";
import { Call } from "@/components/icons/call";
import { Whatsapp } from "@/components/icons/whatsapp";
import { buildWhatsAppLink, propertyInquiryMessage } from "@/lib/whatsapp";

interface RealtorInformationCardProps {
  listing: IListing;
}

export default function RealtorInformationCard({
  listing,
}: RealtorInformationCardProps) {
  const realtorName = listing?.realtor?.full_name || "Listing Agent";
  const avatarUrl = listing?.realtor?.realtor_pic || null;

  const initials = (realtorName.trim().match(/\b\w/g) || ["R"])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <div className="size-12 rounded-full overflow-hidden shrink-0 bg-primary flex items-center justify-center text-white font-bold text-base">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                width={48}
                height={48}
                alt="Realtor avatar"
                className="object-cover w-full h-full"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
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
          {whatsappHref && (
            <Link
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
            </Link>
          )}

          {listing?.realtor?.mobile_number && (
            <Link
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
            </Link>
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