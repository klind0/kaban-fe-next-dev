"use client";

import { Controller, useForm } from "react-hook-form";
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
};

export type MediaFormHandle = {
    getValues: () => MediaListingData;
};

const MediaForm = React.forwardRef<MediaFormHandle, Props>(function MediaForm({ onNext, onBack }, ref) {
    const MAX_IMAGES = 10;

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        clearErrors,
        setError,
        getValues,
        register,
    } = useForm<MediaFormValues>({
        defaultValues: { images: [], cover_index: 0, video_url: "" },
        mode: "onChange", // Validates dynamically as modifications happen
    });

    const [files, setFiles] = React.useState<File[]>([]);
    const [previews, setPreviews] = React.useState<string[]>([]);
    const [coverIndex, setCoverIndex] = React.useState<number>(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Explicitly register images field with rules
    React.useEffect(() => {
        register("images", {
            required: "At least one property image is required",
            validate: {
                maxFiles: (value) => value.length <= MAX_IMAGES || `You can upload a maximum of ${MAX_IMAGES} images.`,
                minFiles: (value) => value.length >= 1 || "At least one property image is required",
            }
        });
    }, [register]);

    React.useImperativeHandle(ref, () => ({
        getValues: () => ({
            images: files,
            cover_index: coverIndex,
            video_url: getValues('video_url'),
        }),
    }), [files, coverIndex, getValues]);

    const handleFiles = React.useCallback(
        (incoming: FileList | null) => {
            if (!incoming || incoming.length === 0) return;
            
            setFiles((prev) => {
                const totalTargetCount = prev.length + incoming.length;
                const newFiles = Array.from(incoming);
                const merged = [...prev, ...newFiles];

                // If total exceeds max, attach the hook form validation error explicitly
                if (totalTargetCount > MAX_IMAGES) {
                    setError("images", { 
                        type: "manual", 
                        message: `Limit exceeded. Maximum allowed images is ${MAX_IMAGES}. You tried uploading ${totalTargetCount}.` 
                    });
                    toast.error(`Cannot add files. Maximum image limit is ${MAX_IMAGES}.`);
                    return prev; 
                }

                setValue("images", merged, { shouldValidate: true });
                clearErrors("images");
                setPreviews((p) => [...p, ...newFiles.map((f) => URL.createObjectURL(f))]);
                return merged;
            });
        },
        [setValue, clearErrors, setError]
    );

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        const nextFiles = files.filter((_, i) => i !== index);
        const nextPreviews = previews.filter((_, i) => i !== index);
        
        setFiles(nextFiles);
        setPreviews(nextPreviews);
        setValue("images", nextFiles, { shouldValidate: true });
        
        if (nextFiles.length === 0) {
            setError("images", { type: "manual", message: "At least one property image is required" });
        } else {
            clearErrors("images");
        }

        if (coverIndex === index) {
            setCoverIndex(0);
            setValue("cover_index", 0);
        } else if (coverIndex > index) {
            setCoverIndex((c) => c - 1);
            setValue("cover_index", coverIndex - 1);
        }
    };

    const setCover = (index: number) => {
        setCoverIndex(index);
        setValue("cover_index", index);
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
    };

    const onSubmit = (data: MediaFormValues) => {
        if (!files.length) {
            setError("images", { message: "At least one property image is required" });
            return;
        }
        if (files.length > MAX_IMAGES) {
            setError("images", { message: `Maximum allowed images is ${MAX_IMAGES}.` });
            return;
        }
        onNext({ images: files, cover_index: coverIndex, video_url: data.video_url });
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
                                                i === coverIndex ? "border-primary" : "border-transparent"
                                            }`}
                                        >
                                            <Image
                                                src={src}
                                                alt={`upload-${i}`}
                                                fill
                                                className="object-cover"
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
                                            {i === coverIndex ? (
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
                                Dad)}
                            </div>
                        </div>
                    )}

                    {/* Dropzone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                        onClick={() => inputRef.current?.click()}
                        className={`border border-dashed rounded-2xl cursor-pointer py-10 flex flex-col items-center justify-center gap-3 transition-colors ${
                            isDragging ? "border-primary bg-primary/5" : errors.images ? "border-red-500 bg-red-50/10" : "border-primary"
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                            <ImageIcon />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm text-center">
                                <span className="font-semibold text-foreground underline">Click here to upload</span> or drag and drop
                            </p>
                            <p className="text-xs! font-medium">PNG, JPG (max 10 pictures total)</p>
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
                    <Button variant="outline" type="button" className="md:min-w-30" onClick={onBack}>Previous</Button>
                    <Button type="submit" className="md:min-w-30">Next</Button>
                </div>
            </FormCard>
        </form>
    );
});

export default MediaForm;