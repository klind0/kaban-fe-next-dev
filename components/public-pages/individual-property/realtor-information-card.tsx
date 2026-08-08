import { Building2 } from '@/components/icons/buildings';
import { Location } from '@/components/icons/location';
import { Button } from '@/components/ui/button';
import { IListing } from '@/types/listingTypes';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark } from '@/components/icons/bookmark';
import { Call } from '@/components/icons/call';
import { Whatsapp } from '@/components/icons/whatsapp';
import { ExternalLink } from '@/components/icons/external-link';
import { useUserStore } from "@/app/stores/user-store";

interface RealtorInformationCardProps {
    listing: IListing;
}

export default function RealtorInformationCard({ listing }: RealtorInformationCardProps) {
    const { user, realtor } = useUserStore();

    // 🛠️ Check user/realtor store values first, then fallback to listing.realtor
    const realtorName =
        user?.full_name ||
        (user as any)?.fullName ||
        realtor?.full_name ||
        listing?.realtor?.full_name ||
        "Listing Agent";

    const realtorEmail =
        user?.email ||
        realtor?.email ||
        listing?.realtor?.email ||
        null;

    const avatarUrl =
        realtor?.realtor_pic ||
        user?.profile_pic ||
        listing?.realtor?.realtor_pic ||
        null;

    const initials = (realtorName.trim().match(/\b\w/g) || ["R"])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="border border-neutral-600 rounded-[10px] shadow">
            <div className="p-4 flex items-center justify-between text-foreground flex-wrap font-semibold border-b border-neutral-600">
                <h5>Listing Realtor</h5>
            </div>

            <div className="p-4 space-y-6">
                {/* Realtor Profile Avatar, Name, and Email */}
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
                        <h4 className="text-foreground font-bold truncate">
                            {realtorName}
                        </h4>
                        {realtorEmail && (
                            <p className="text-sm text-neutral-500 truncate mt-0.5">
                                {realtorEmail}
                            </p>
                        )}
                    </div>
                </div>

                {/* Commented Out Metadata Sections */}
                {/*
                <div className="space-y-3 text-sm">
                    {listing?.location?.address && (
                        <div className="flex items-center gap-2">
                            <Location className="size-5" />
                            <span className="font-medium">{listing.location.address}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Building2 className="size-5" />
                        <span className="font-medium">15 listed properties on Kaban.ng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bookmark className="size-5" />
                        <span className="font-medium">Registered 4 years ago</span>
                    </div>
                </div>
                */}

                {/* Action Buttons: WhatsApp & Call */}
                <div className="flex items-center gap-4">
                    {listing?.realtor?.whatsapp_number && (
                        <Link
                            href={`https://wa.me/${listing.realtor.whatsapp_number.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button variant="outline" className="w-full text-primary border-primary gap-2">
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
                            <Button variant="outline" className="w-full text-primary border-primary gap-2">
                                <Call className="size-5" />
                                Call
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Commented Out Bottom Drawer Section */}
            {/*
            <div className="border-t border-neutral-600 p-4">
                <Link href="#" className="flex items-center justify-center gap-2 text-primary font-medium hover:underline">
                    View all listings from this agent
                    <ExternalLink className="size-4" />
                </Link>
            </div>
            */}
        </div>
    );
}