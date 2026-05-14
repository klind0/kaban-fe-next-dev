"use client";

import { Camera } from '@/components/icons/camera'
import { Heart } from '@/components/icons/heart'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { IListing } from '@/types/listingTypes'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function PropertyImages({ listing }: { listing: IListing }) {
    const [isFavorited, setIsFavorited] = React.useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [previewOpen, setPreviewOpen] = React.useState(false);

    const images = listing?.images ?? [];
    const totalImages = images.length;
    const currentImage = images[currentImageIndex]?.url;

    const daysAgo = Math.floor((Date.now() - new Date(listing?.createdAt ?? '').getTime()) / (1000 * 60 * 60 * 24));
    const daysLabel = daysAgo <= 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

    const changeImage = (newIndex: number) => {
        if (newIndex === currentImageIndex) return;
        setTimeout(() => {
            setCurrentImageIndex(newIndex);
        }, 200);
    };

    const nextImage = () => changeImage((currentImageIndex + 1) % totalImages);
    const prevImage = () => changeImage((currentImageIndex - 1 + totalImages) % totalImages);

    const openPreview = (index?: number) => {
        if (index !== undefined) setCurrentImageIndex(index);
        setPreviewOpen(true);
    };

    return (
        <div>
            <div className="relative w-full h-100 md:h-120 lg:h-125 overflow-hidden bg-neutral-100 transition-all duration-500 ease-linear">
                {currentImage && (
                    <Image
                        src={currentImage}
                        alt={listing?.title ?? "Property image"}
                        fill
                        className="object-cover cursor-zoom-in transition-opacity duration-500 ease-in-out"
                        priority
                        onClick={() => openPreview()}
                    />
                )}
                <div className="absolute inset-0 bg-black/15 pointer-events-none" />

                {/* Days ago badge */}
                <div className="w-full flex items-center justify-between absolute top-4 md:top-6 left-0 px-4 md:px-6">
                    <div className=" bg-black/40 backdrop-blur-[25px] px-3 py-2 rounded-lg text-white text-xs font-semibold">
                        {daysLabel}
                    </div>

                    {/* Favorite */}
                    <button
                        onClick={() => setIsFavorited(!isFavorited)}
                        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart filled={isFavorited} />
                    </button>
                </div>

                {/* Navigation arrows */}
                {totalImages > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-[#00000080] text-white hover:bg-[#0000004f] rounded-full size-10 md:size-12 flex items-center justify-center shadow transition">
                            <ChevronLeft className="size-5" />
                        </button>
                        <button onClick={nextImage} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-[#00000080] text-white hover:bg-[#0000004f] rounded-full size-10 md:size-12 flex items-center justify-center shadow transition">
                            <ChevronRight className="size-5" />
                        </button>
                    </>
                )}

                {/* Photo count */}
                <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex items-center gap-1.5">
                    <Camera />
                    <span className="text-white text-sm font-semibold">{currentImageIndex + 1}/{totalImages}</span>
                </div>
            </div>

            {/* Thumbnails */}
            {totalImages > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => changeImage(i)}
                            className={`relative shrink-0 w-20 md:w-28 h-16 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ease-linear ${i === currentImageIndex ? "border-primary" : "border-transparent"}`}
                        >
                            <Image src={img.url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen preview modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="h-svh p-0 border-none bg-black/95 [&>button]:hidden rounded-none max-w-screen sm:max-w-screen">
                    <DialogTitle className='sr-only'>Property images</DialogTitle>
                    <div className="relative w-full  flex items-center justify-center">
                        {/* Close button */}
                        <button
                            onClick={() => setPreviewOpen(false)}
                            className="absolute top-4 right-4 z-10 bg-[#00000080] hover:bg-[#0000004f] rounded-full size-10 flex items-center justify-center text-white outline-none"
                            autoFocus={false}
                        >
                            <X className="size-5" />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-4 left-4 z-10 text-white text-sm font-semibold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg">
                            {currentImageIndex + 1} / {totalImages}
                        </div>

                        {/* Navigation */}
                        {totalImages > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-[#00000080] hover:bg-[#0000004f] rounded-full size-10 md:size-12 flex items-center justify-center text-white transition">
                                    <ChevronLeft className="size-6" />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-[#00000080] hover:bg-[#0000004f] rounded-full size-10 md:size-12 flex items-center justify-center text-white transition">
                                    <ChevronRight className="size-6" />
                                </button>
                            </>
                        )}

                        {/* Preview image */}
                        {currentImage && (
                            <Image
                                src={currentImage}
                                alt={`${listing?.title ?? "Property"} - Image ${currentImageIndex + 1}`}
                                fill
                                className={`object-contain transition-opacity duration-500 ease-in-out`}
                                priority
                            />
                        )}

                        {/* Thumbnail strip */}
                        {totalImages > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] pb-1 px-2">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => changeImage(i)}
                                        className={`relative shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-300 ease-linear ${i === currentImageIndex ? "border-white" : "border-transparent opacity-50 hover:opacity-80"}`}
                                    >
                                        <Image src={img.url} alt={`Thumbnail ${i + 1}`} fill className="object-cover transition-all duration-300 ease-linear" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
