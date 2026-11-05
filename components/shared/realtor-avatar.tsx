"use client";

import Image from "next/image";
import { cn } from "@/lib/utils"; // or your cn helper

interface RealtorAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;          // px
  isFoundingRealtor?: boolean;
  className?: string;
  badgeSize?: number;     // optional override
}

export default function RealtorAvatar({
  src,
  alt = "Realtor",
  size = 80,
  isFoundingRealtor = false,
  className,
  badgeSize,
}: RealtorAvatarProps) {
  const badgeDimension = badgeSize ?? Math.round(size * 0.42); // ~42% of avatar size works well

  return (
    <div
      className={cn("relative inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-full bg-neutral-200">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={`${size}px`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-500 text-sm font-medium">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {isFoundingRealtor && (
        <div
          className="absolute -bottom-1 -right-1 z-10 drop-shadow-md"
          style={{ width: badgeDimension, height: badgeDimension }}
        >
          <Image
            src="/badges/founding-realtor-20.png"   // ← put the badge here
            alt="Founding Realtor"
            width={badgeDimension}
            height={badgeDimension}
            className="object-contain"
            priority={false}
          />
        </div>
      )}
    </div>
  );
}