import { Building2 } from '@/components/icons/buildings';
import { Location } from '@/components/icons/location';
import { Button } from '@/components/ui/button';
import { IListing } from '@/types/listingTypes';
import { Star } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';
import DefaultAvatar from "@/app/assets/images/sample-avatar.png";
import { Bookmark } from '@/components/icons/bookmark';
import { Call } from '@/components/icons/call';
import { Whatsapp } from '@/components/icons/whatsapp';
import { Sms } from '@/components/icons/sms';
import { ExternalLink } from '@/components/icons/external-link';

interface RealtorInformationCardProps {
    listing: IListing;
}

export default function RealtorInformationCard({ listing }: RealtorInformationCardProps) {
    return (
        <div className="border border-neutral-600 rounded-[10px] shadow">
            <div className="p-4 flex items-center justify-between text-foreground flex-wrap font-semibold border-b border-neutral-600">
                <h5>Listing Realtor</h5>
            </div>

            <div className="p-4 space-y-6">
                <div className='flex items-center gap-3'>
                    <div className="size-12 rounded-full overflow-hidden shrink-0">
                        <Image src={listing.realtor.realtor_pic ?? DefaultAvatar} width={48} height={48} alt="Realtor avatar" className="object-cover" />
                    </div>
                    <div>
                        <h4 className='text-foreground font-bold'>{"Realtor's Name"}</h4>
                        <div className="flex items-center gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`size-4 ${star <= 3 ? "fill-[#F9B900] text-[#F9B900]" : "text-neutral-700"}`} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-3 text-sm">
                    {listing?.location?.address && (
                        <div className="flex items-center gap-2">
                            <Location className='size-5' />
                            <span className='font-medium'>{listing.location.address}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Building2 className="size-5" />
                        {/* Update this to actual number of properties listed by the realtor once that data is available */}
                        <span className='font-medium'>15 listed properties on Kaban.ng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Bookmark className="size-5" />
                        {/* Update this to actual registration date of the realtor once that data is available */}
                        <span className='font-medium'>Registered 4 years ago</span>
                    </div>
                    {listing?.realtor?.mobile_number && (
                        <div className="flex items-center gap-2">
                            <Call className="size-5" />
                            <Link href={`tel:${listing?.realtor?.mobile_number}`} className='font-medium '>{listing.realtor.mobile_number}</Link>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-8">
                    {listing?.realtor?.whatsapp_number && (
                        <Link
                            href={`https://wa.me/${listing.realtor.whatsapp_number.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                        >
                            <Button variant="outline" className="w-full text-primary border-primary">
                                <Whatsapp className='size-5' />
                                WhatsApp
                            </Button>
                        </Link>
                    )}
                    <Link
                        href={`mailto:${listing.realtor.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                    >
                        <Button variant="outline" className="w-full text-primary border-primary">
                            <Sms className='size-5' />
                            Email
                        </Button>
                    </Link>
                </div>
            </div>
            <div className='border-t border-neutral-600 p-4'>
                <Link href="#" className="flex items-center justify-center gap-2 text-primary font-medium hover:underline">
                    View all listings from this agent
                    <ExternalLink className='size-4' />
                </Link>
            </div>
        </div>
    )
}
