"use client";

import Image from "next/image";
import { cn } from "@/lib/utils"; // adjust if your cn helper is different

interface RealtorAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;                 // diameter in px
  isFoundingRealtor?: boolean;
  className?: string;
  badgeSize?: number;            // optional override
  fallbackText?: string;
  fallbackClassName?: string;
}

export default function RealtorAvatar({
  src,
  alt = "Realtor",
  size = 48,
  isFoundingRealtor = false,
  className,
  badgeSize,
  fallbackText,
  fallbackClassName,
}: RealtorAvatarProps) {
  const badgeDimension = badgeSize ?? Math.round(size * 0.42);

  return (
    <div
      className={cn("relative inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    >
      {/* Profile photo */}
      <div className="relative h-full w-full overflow-hidden rounded-full bg-neutral-200">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={`${size}px`}
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center text-sm font-medium text-neutral-500",
              fallbackClassName,
            )}
          >
            {fallbackText ?? alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Founding badge */}
      {isFoundingRealtor && (
        <div
          className="absolute -bottom-0.5 -right-0.5 z-10 drop-shadow-md"
          style={{ width: badgeDimension, height: badgeDimension }}
        >
          <Image
            src="/badges/founding-realtor-20.png"
            alt="Founding Realtor"
            width={badgeDimension}
            height={badgeDimension}
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}