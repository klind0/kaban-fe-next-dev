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
    images: File[];
    cover_index: number;
    video_url: string;
};

type Props = {
    onNext: (data: MediaListingData) => void;
    onBack: () => void;
    initialData?: Partial<MediaListingData>;
};

export type MediaFormHandle = {
    getValues: () => MediaListingData;
};

const MediaForm = React.forwardRef<MediaFormHandle, Props>(function MediaForm(
    { onNext, onBack, initialData },
    ref
) {
    const MAX_IMAGES = 10;

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
            images: initialData?.images || [],
            cover_index: initialData?.cover_index || 0,
            video_url: initialData?.video_url || "",
        },
        mode: "onChange",
    });

    // React Hook Form Watchers
    const watchedImages = useWatch({ control, name: "images" }) || [];
    const watchedCoverIndex = useWatch({ control, name: "cover_index" }) || 0;

    const [previews, setPreviews] = React.useState<string[]>([]);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Sync object URL previews cleanly with the react-hook-form single-source-of-truth images array
    React.useEffect(() => {
        const objectUrls = watchedImages.map((file) => URL.createObjectURL(file));
        setPreviews(objectUrls);

        // Revoke the memory allocations once the source tracking switches up
        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [watchedImages]);

    // Handle Imperative Actions from the workflow controller
    React.useImperativeHandle(
        ref,
        () => ({
            getValues: () => ({
                images: getValues("images"),
                cover_index: getValues("cover_index"),
                video_url: getValues("video_url"),
            }),
        }),
        [getValues]
    );

    const handleFiles = React.useCallback(
        (incoming: FileList | null) => {
            if (!incoming || incoming.length === 0) return;

            const currentFiles = getValues("images") || [];
            const totalTargetCount = currentFiles.length + incoming.length;
            const newFiles = Array.from(incoming);
            const merged = [...currentFiles, ...newFiles];

            if (totalTargetCount > MAX_IMAGES) {
                setError("images", {
                    type: "manual",
                    message: `Limit exceeded. Maximum allowed images is ${MAX_IMAGES}. You tried uploading ${totalTargetCount}.`,
                });
                toast.error(`Cannot add files. Maximum image limit is ${MAX_IMAGES}.`);
                return;
            }

            setValue("images", merged, { shouldValidate: true });
            clearErrors("images");
        },
        [setValue, clearErrors, setError, getValues]
    );

    const removeImage = (index: number) => {
        const currentFiles = getValues("images") || [];
        const nextFiles = currentFiles.filter((_, i) => i !== index);

        setValue("images", nextFiles, { shouldValidate: true });

        if (nextFiles.length === 0) {
            setError("images", {
                type: "manual",
                message: "At least one property image is required",
            });
        } else {
            clearErrors("images");
        }

        // Adjust index pointer tracking rules gracefully when items shift positions
        if (watchedCoverIndex === index) {
            setValue("cover_index", 0);
        } else if (watchedCoverIndex > index) {
            setValue("cover_index", watchedCoverIndex - 1);
        }
    };

    const setCover = (index: number) => {
        setValue("cover_index", index);
    };

    const scrollRight = () => {
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

        onNext({
            images: data.images,
            cover_index: data.cover_index,
            video_url: data.video_url,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-7.5 mt-8">
            <FormCard title="Image">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-foreground text-sm font-medium">
                            Upload high-quality images * (Max {MAX_IMAGES})
                        </label>
                        {errors.images && (
                            <span className="text-[#B02817] text-xs sm:text-sm font-medium bg-red-50 px-2 py-1 rounded">
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
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center z-10 hover:bg-red-600 transition-colors"
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
                                                    onClick={() => setCover(i)}
                                                    className="absolute bottom-2 left-2 bg-white hover:bg-white/70 text-foreground text-xs font-semibold px-3 py-1 rounded z-10 transition-colors"
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
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            handleFiles(e.dataTransfer.files);
                        }}
                        onClick={() => inputRef.current?.click()}
                        className={`border border-dashed rounded-2xl cursor-pointer py-10 flex flex-col items-center justify-center gap-3 transition-colors ${
                            isDragging
                                ? "border-primary bg-primary/5"
                                : errors.images
                                ? "border-red-500 bg-red-50/10"
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
                            <p className="text-xs! font-medium">
                                PNG, JPG (max 10 pictures total)
                            </p>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            multiple
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
                                {...field}
                                placeholder="Youtube, Vimeo"
                            />
                        )}
                    />
                    <p className="text-xs text-neutral-500">
                        Example: https://www.youtube.com/watch?v=8T7SnBQDiuM
                    </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        type="button"
                        className="md:min-w-30"
                        onClick={onBack}
                    >
                        Previous
                    </Button>
                    <Button type="submit" className="md:min-w-30">
                        Next
                    </Button>
                </div>
            </FormCard>
        </form>
    );
});

export default MediaForm;