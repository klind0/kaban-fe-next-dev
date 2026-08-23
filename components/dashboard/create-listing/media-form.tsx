"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ChevronRight, X } from "lucide-react";
import FormCard from "./form-card";
import FormControl from "@/components/universal/form-control";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "@/components/icons/image-icon";
import Image from "next/image";
import React from "react";
import { MediaListingData } from "@/network/listings";

type MediaFormValues = {
    images: (File | string)[];
    cover_index: number;
    video_url: string;
};

type Props = {
    onNext?: (data: MediaListingData) => void;       // For creation wizard flow
    onFormSubmit?: (data: MediaListingData) => void; // Standardized framework callback
    onBack: () => void;
    isPending?: boolean;                             // Controls button mutation loaders
    initialData?: Partial<MediaListingData> | any;   // Handles editing pre-fills
    externalErrors?: any;                            // 🚀 ADD THIS LINE TO FIX THE TYPE ERROR
};

export type MediaFormHandle = {
    getValues: () => MediaListingData;
};

const MediaForm = React.forwardRef<MediaFormHandle, Props>(function MediaForm(
    { onNext, onFormSubmit, onBack, isPending = false, initialData },
    ref
) {

    const MAX_IMAGES = 10;

    // Normalizes schema variations depending on how your backend branch structure passes media attachments
    const prefilledImages = initialData?.images || initialData?.media_urls || [];

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        clearErrors,
        setError,
        getValues,
    } = useForm<MediaFormValues>({
        defaultValues: {
            images: prefilledImages,
            cover_index: initialData?.cover_index || 0,
            video_url: initialData?.video_url || "",
        },
        mode: "onChange",
    });

    const watchedImages = useWatch({ control, name: "images" }) || [];
    const watchedCoverIndex = useWatch({ control, name: "cover_index" }) || 0;

    const [previews, setPreviews] = React.useState<string[]>([]);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // 🚀 Loop Protection: Convert array instances to a stable serialized primitive string
    const imagesSignature = React.useMemo(() => {
        return (watchedImages || [])
            .map((img) => (img instanceof File ? `${img.name}-${img.size}` : img))
            .join(",");
    }, [watchedImages]);

    // ----------------------------------------------------
    // 🔍 HOOK DEPENDENCY MUTATION DIAGNOSTICS
    // ----------------------------------------------------
    const previousDeps = React.useRef({ imagesSignature, initialData });
    React.useEffect(() => {
        const changes: Record<string, any> = {};
        if (imagesSignature !== previousDeps.current.imagesSignature) {
            changes.imagesSignature = { before: previousDeps.current.imagesSignature, after: imagesSignature };
        }
        if (initialData !== previousDeps.current.initialData) {
            changes.initialData = { before: previousDeps.current.initialData, after: initialData };
        }
        
        if (Object.keys(changes).length > 0) {
            console.warn("⚡ [DIAGNOSTIC] MediaForm dependency values mutated:", changes);
        }
        previousDeps.current = { imagesSignature, initialData };
    }, [imagesSignature, initialData]);
    // ----------------------------------------------------

    // Dynamic generation of client memory paths for local files or hosting server URLs
    React.useEffect(() => {
        const objectUrls = watchedImages.map((img) => {
            if (img instanceof File) {
                return URL.createObjectURL(img);
            }
            return img; // Already a secure remote cloud URL string
        });

        setPreviews(objectUrls);

        // Memory optimization cleanup callback
        return () => {
            objectUrls.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
        // 🚀 Loop Protection: Hook runs only when the serialized string representation changes
    }, [imagesSignature]);

    React.useImperativeHandle(
        ref,
        () => ({
            getValues: () => {
                const currentData = getValues();
                const imagesCopy = [...(currentData.images || [])];
                const targetCoverIdx = currentData.cover_index || 0;

                // Safely mirror submission reordering logic if parent steps query values out via imperative ref
                if (targetCoverIdx > 0 && targetCoverIdx < imagesCopy.length) {
                    const [coverImg] = imagesCopy.splice(targetCoverIdx, 1);
                    imagesCopy.unshift(coverImg);
                    return {
                        images: imagesCopy as any,
                        cover_index: 0,
                        video_url: currentData.video_url,
                    };
                }

                return {
                    images: currentData.images as any,
                    cover_index: targetCoverIdx,
                    video_url: currentData.video_url,
                };
            },
        }),
        [getValues]
    );

    const handleFiles = React.useCallback(
        (incoming: FileList | null) => {
            if (!incoming || incoming.length === 0) return;

            const currentAssets = getValues("images") || [];
            const totalTargetCount = currentAssets.length + incoming.length;
            
            if (totalTargetCount > MAX_IMAGES) {
                setError("images", {
                    type: "manual",
                    message: `Limit exceeded. Maximum allowed images is ${MAX_IMAGES}. You tried uploading ${totalTargetCount}.`,
                });
                toast.error(`Cannot add files. Maximum image limit is ${MAX_IMAGES}.`);
                return;
            }

            const incomingFilesArray = Array.from(incoming);
            console.log("📸 Frontend Files Selected:", incomingFilesArray.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            })));
            const mergedAssets = [...currentAssets, ...incomingFilesArray];

            setValue("images", mergedAssets, { shouldValidate: true, shouldDirty: true });
            clearErrors("images");
        },
        [setValue, clearErrors, setError, getValues]
    );

    const removeImage = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const currentAssets = getValues("images") || [];
        const nextAssets = currentAssets.filter((_, i) => i !== index);

        setValue("images", nextAssets, { shouldValidate: true, shouldDirty: true });

        if (nextAssets.length === 0) {
            setError("images", {
                type: "manual",
                message: "At least one property image is required",
            });
        } else {
            clearErrors("images");
        }

        if (watchedCoverIndex === index) {
            setValue("cover_index", 0);
        } else if (watchedCoverIndex > index) {
            setValue("cover_index", watchedCoverIndex - 1);
        }
    };

    const setCover = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setValue("cover_index", index, { shouldDirty: true });
    };

    const scrollRight = (e: React.MouseEvent) => {
        e.stopPropagation();
        scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
    };

    const onSubmit = (data: MediaFormValues) => {
        if (data.images.length === 0) {
            setError("images", {
                type: "manual",
                message: "At least one property image is required to proceed",
            });
            toast.error("Please upload at least one image.");
            return;
        }

        // Create a shallow copy of the arrays to safely transform array indexing orders
        const imagesPayload = [...data.images];
        let finalCoverIndex = data.cover_index;

        // Reorder: Move selected cover image to index [0] so the backend naturally treats it as primary
        if (finalCoverIndex > 0 && finalCoverIndex < imagesPayload.length) {
            const [selectedCoverAsset] = imagesPayload.splice(finalCoverIndex, 1);
            imagesPayload.unshift(selectedCoverAsset);
            finalCoverIndex = 0; // The cover is now at the absolute front
        }

        const normalizedPayload: MediaListingData = {
            images: imagesPayload as any,
            cover_index: finalCoverIndex,
            video_url: data.video_url,
        };

        // Fire whichever callback parameter is mounted by the current parent wizard route
        if (onFormSubmit) {
            onFormSubmit(normalizedPayload);
        } else if (onNext) {
            onNext(normalizedPayload);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-7.5 mt-8">
            <FormCard title="Media Uploads">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-foreground text-sm font-medium">
                            Upload high-quality images * (Max {MAX_IMAGES})
                        </label>
                        {errors.images && (
                            <span className="text-red-600 text-xs sm:text-sm font-medium bg-red-50 border border-red-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
                                {errors.images.message || "This field contains errors"}
                            </span>
                        )}
                    </div>

                    {/* Image carousel */}
                    {previews.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                Uploaded Images ({previews.length} / {MAX_IMAGES})
                            </p>
                            <div className="relative">
                                <div
                                    ref={scrollRef}
                                    className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    {previews.map((src, i) => (
                                        <div
                                            key={i}
                                            className={`relative shrink-0 w-60 h-42.5 rounded-lg overflow-hidden border-2 ${
                                                i === watchedCoverIndex
                                                    ? "border-primary"
                                                    : "border-transparent"
                                            }`}
                                        >
                                            <Image
                                                src={src}
                                                alt={`upload-${i}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                disabled={isPending}
                                                onClick={(e) => removeImage(e, i)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center z-10 hover:bg-red-600 transition-colors disabled:opacity-50"
                                            >
                                                <X size={12} className="text-white" />
                                            </button>
                                            {/* Cover badge / Set cover button */}
                                            {i === watchedCoverIndex ? (
                                                <div className="absolute bottom-2 left-2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded z-10">
                                                    Cover
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={(e) => setCover(e, i)}
                                                    className="absolute bottom-2 left-2 bg-white hover:bg-white/70 text-foreground text-xs font-semibold px-3 py-1 rounded z-10 transition-colors disabled:opacity-50"
                                                >
                                                    Set cover
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* Scroll right button */}
                                {previews.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={scrollRight}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-white border border-neutral-300 shadow flex items-center justify-center z-10 hover:bg-neutral-50 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Dropzone */}
                    <div
                        onDragOver={(e) => {
                            if (isPending) return;
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            if (isPending) return;
                            e.preventDefault();
                            setIsDragging(false);
                            handleFiles(e.dataTransfer.files);
                        }}
                        onClick={() => {
                            if (!isPending) inputRef.current?.click();
                        }}
                        className={`border border-dashed rounded-2xl cursor-pointer py-10 flex flex-col items-center justify-center gap-3 transition-colors ${
                            isPending ? "opacity-60 cursor-not-allowed border-neutral-300 bg-neutral-50" :
                            isDragging
                                ? "border-primary bg-primary/5"
                                : errors.images
                                ? "border-red-500 bg-red-50/20"
                                : "border-primary"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                            <ImageIcon />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm text-center">
                                <span className="font-semibold text-foreground underline">
                                    Click here to upload
                                </span>{" "}
                                or drag and drop
                            </p>
                            <p className="text-xs font-medium text-neutral-800">
                                PNG, JPG (max 10 pictures total)
                            </p>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            multiple
                            disabled={isPending}
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5 mt-4">
                    <Controller
                        name="video_url"
                        control={control}
                        render={({ field }) => (
                            <FormControl
                                as="input"
                                type="url"
                                labelText="Video URL"
                                disabled={isPending}
                                {...field}
                                placeholder="Youtube, Vimeo"
                            />
                        )}
                    />
                    <p className="text-xs text-neutral-800">
                        Example: https://www.youtube.com/watch?v=8T7SnBQDiuM
                    </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        type="button"
                        className="md:min-w-30"
                        onClick={onBack}
                        disabled={isPending}
                    >
                        Previous
                    </Button>
                    <Button type="submit" className="md:min-w-30" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Next'}
                    </Button>
                </div>
            </FormCard>
        </form>
    );
});

export default MediaForm;