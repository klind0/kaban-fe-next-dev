'use client';

import Image from 'next/image';
import Link from 'next/link';
import DefaultPropertyImg from '@/app/assets/images/blank-img.png';
import { Camera } from '@/components/icons/camera';
import { Location } from '@/components/icons/location';
import { Trash } from '@/components/icons/trash';
import { Edit } from '@/components/icons/edit';
import { RefreshRightSquare } from '@/components/icons/refresh-right-square';
import { SendSqaure2 } from '@/components/icons/send-sqaure-2';
import { formatPrice } from '@/lib/formatPrice';
import ListingStateBadge from '@/components/dashboard/listing-state-badge';
import { IListing } from '@/types/listingTypes';
import { generateListingSlug } from '@/lib/manageSlug';

interface ListingCardProps {
  listing: IListing;
  isPending: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onRelist: (id: string) => void;
  onUpgrade: (id: string) => void;
}

/** Formats ISO string or Date to D/M/YYYY without time */
function formatDateOnly(dateString?: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
}

export default function ListingCard({
  listing,
  isPending,
  onDelete,
  onEdit,
  onRelist,
  onUpgrade,
}: ListingCardProps) {
  const isPastExpiration = listing?.expiresAt && new Date(listing.expiresAt).getTime() < Date.now();

  const rawState = (
    (listing as any).effectiveState || listing?.listing_state
  )?.toUpperCase();

  const currentItemState = isPastExpiration ? 'EXPIRED' : rawState;

  const isExpired = currentItemState === 'EXPIRED';
  const isLive = currentItemState === 'PUBLISHED';
  const isPendingApproval = currentItemState === 'PENDING_APPROVAL';
  const isFeaturedAlready = !!listing?.isFeatured;

  // Handle title click when listing is not published
  const handleTitleClick = (e: React.MouseEvent) => {
    if (isLive) return;

    e.preventDefault();

    switch (currentItemState) {
      case 'DRAFT':
        alert('This listing is a draft and has not been published yet.');
        break;
      case 'PENDING_APPROVAL':
        alert(
          'This listing is currently pending approval and is not publicly visible yet.',
        );
        break;
      case 'EXPIRED':
        alert('This listing has expired and is no longer public.');
        break;
      case 'REJECTED':
        alert(
          'This listing was rejected and cannot be viewed on the main platform.',
        );
        break;
      default:
        alert('This listing is currently unavailable for viewing.');
        break;
    }
  };

  // Safe location extraction with fallbacks
  const addressParts = [
    listing?.location?.address,
    listing?.location?.city,
    listing?.location?.state,
  ].filter(Boolean);

  const formattedLocation =
    addressParts.length > 0 ? addressParts.join(', ') : 'Location not provided';

  // Compute SEO slug URL
  const propertySlug = listing ? generateListingSlug(listing) : '';
  const propertyHref = `/property/${propertySlug}`;

  return (
    <div className="py-3 px-6 border-b border-neutral-600 last:border-0 flex max-sm:flex-col md:max-lg:flex-col gap-4">
      {/* Image Container */}
      <div className="w-full lg:max-w-75 md:max-lg:w-full h-46.75 relative">
        <div className="absolute top-4 left-4 flex items-center gap-1 z-10">
          <Camera />
          <span className="text-white font-medium">
            {listing?.images?.length || 0}
          </span>
        </div>
        <Image
          src={listing?.images?.[0]?.url || DefaultPropertyImg}
          fill
          alt={listing?.title || 'Property image'}
          className="object-cover rounded-md w-full"
        />
      </div>

      {/* Main Details */}
      <div className="w-full flex flex-col justify-between">
        <div className="flex w-full h-full justify-between">
          <div className="flex w-full flex-col text-foreground">
            <div className="flex">
              <div>
                <span className="text-sm">{listing?.property_type}</span>
                <h3 className="text-xl font-bold -tracking-[0.1px]">
                  {formatPrice(listing?.price?.amount || 0)}
                </h3>
              </div>
              <div className="flex justify-end w-full gap-2">
                {listing?.status && (
                  <div className="w-fit flex h-fit bg-[#006AFF]/10 text-primary text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2">
                    ●{' '}
                    {listing.status.charAt(0).toUpperCase() +
                      listing.status.slice(1)}
                  </div>
                )}
                {isFeaturedAlready && (
                  <div className="w-fit h-fit bg-[#41AE49]/10 text-[#41AE49] text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2">
                    ● Featured
                  </div>
                )}
                <ListingStateBadge state={currentItemState} />
              </div>
            </div>

            {/* Title with dynamic SEO slug link */}
            <Link
              href={propertyHref}
              onClick={handleTitleClick}
              className="text-lg truncate text-primary font-semibold hover:underline w-fit"
            >
              {listing?.title || 'No title'}
            </Link>

            {/* Location with Title Case styling */}
            <div className="flex items-center gap-1 text-gray-50 capitalize">
              <Location />
              <span className="font-medium">{formattedLocation}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions & Dates */}
        <div className="h-full gap-2 mt-2 flex max-sm:flex-col sm:items-end justify-between">
          {/* Conditional Date Display without time (D/M/YYYY) */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {isLive && (
              <>
                {listing?.publishedAt && (
                  <span className="text-xs font-medium">
                    Published: {formatDateOnly(listing.publishedAt)}
                  </span>
                )}
                {listing?.expiresAt && (
                  <span className="text-xs font-medium">
                    Expiring: {formatDateOnly(listing.expiresAt)}
                  </span>
                )}
              </>
            )}

            {isPendingApproval && (
              <span className="text-xs font-medium">
                Submitted: {formatDateOnly(listing?.createdAt)}
              </span>
            )}

            {isExpired && listing?.expiresAt && (
              <span className="text-xs font-medium">
                Expired: {formatDateOnly(listing.expiresAt)}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const targetId = listing?.id || (listing as any)?._id;
                if (targetId) {
                  onDelete(targetId);
                } else {
                  console.error('Delete action failed: Listing ID missing on card', listing);
                }
              }}
              disabled={isPending}
              title="Delete listing"
              className={`p-0.5 rounded transition-colors ${
                isPending
                  ? 'opacity-40 cursor-not-allowed'
                  : 'text-neutral-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Trash />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const targetId = listing?.id || (listing as any)?._id;
                if (targetId) onEdit(targetId);
              }}
              disabled={isPending}
              title="Edit listing"
              className={`p-0.5 rounded transition-colors ${
                isPending
                  ? 'opacity-40 cursor-not-allowed'
                  : 'text-neutral-500 hover:text-primary hover:bg-primary/10'
              }`}
            >
              <Edit />
            </button>

            {isExpired && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const targetId = listing?.id || (listing as any)?._id;
                  if (targetId) onRelist(targetId);
                }}
                disabled={isPending}
                title="Relist listing"
                className="text-primary hover:bg-primary/10 transition-colors p-0.5 rounded"
              >
                <RefreshRightSquare
                  className={isPending ? 'animate-spin' : ''}
                />
              </button>
            )}

            {/*{isLive && !isFeaturedAlready && (
              <button
                onClick={() => onUpgrade(listing.id)}
                disabled={isPending}
                title="Upgrade listing to Featured"
                className={`p-0.5 rounded transition-colors ${
                  isPending
                    ? 'opacity-40 cursor-not-allowed'
                    : 'text-neutral-500 hover:text-[#41AE49] hover:bg-[#41AE49]/10'
                }`}
              >
                <SendSqaure2 />
              </button>
            )}*/}
          </div>
        </div>
      </div>
    </div>
  );
}