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
    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        clearErrors,
        setError,
        getValues,
    } = useForm<MediaFormValues>({
        defaultValues: { images: [], cover_index: 0, video_url: "" },
        mode: "all",
    });

    const [files, setFiles] = React.useState<File[]>([]);
    const [previews, setPreviews] = React.useState<string[]>([]);
    const [coverIndex, setCoverIndex] = React.useState<number>(0);
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => ({
        getValues: () => ({
            images: files,
            cover_index: coverIndex,
            video_url: getValues('video_url'),
        }),
    }), [files, coverIndex, getValues]);

    const MAX_IMAGES = 10;

    const handleFiles = React.useCallback(
        (incoming: FileList | null) => {
            if (!incoming || incoming.length === 0) return;
            setFiles((prev) => {
                const slots = MAX_IMAGES - prev.length;
                if (slots <= 0) {
                    toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
                    return prev;
                }
                const newFiles = Array.from(incoming).slice(0, slots);
                if (newFiles.length < incoming.length) {
                    toast.error(`You can upload a maximum of ${MAX_IMAGES} images. Only ${newFiles.length} image(s) were added.`);
                }
                const merged = [...prev, ...newFiles];
                setValue("images", merged);
                clearErrors("images");
                setPreviews((p) => [...p, ...newFiles.map((f) => URL.createObjectURL(f))]);
                return merged;
            });
        },
        [setValue, clearErrors]
    );

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        const nextFiles = files.filter((_, i) => i !== index);
        const nextPreviews = previews.filter((_, i) => i !== index);
        setFiles(nextFiles);
        setPreviews(nextPreviews);
        setValue("images", nextFiles);
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
        if (!data.images.length) {
            setError("images", { message: "This field is required" });
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
                            Upload high-quality images *
                        </label>
                        {errors.images && (
                            <span className="text-[#B02817] text-xs sm:text-sm whitespace-nowrap">
                                This field is required
                            </span>
                        )}
                    </div>

                    {/* Image carousel */}
                    {previews.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                                Uploaded Images ({previews.length})
                            </p>
                            <div className="relative">
                                <div
                                    ref={scrollRef}
                                    className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    {previews.map((src, i) => (
                                        <div
                                            key={i}
                                            className="relative shrink-0 w-60 h-42.5 rounded-lg overflow-hidden"
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
                                )}
                            </div>
                        </div>
                    )}

                    {/* Dropzone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                        onClick={() => inputRef.current?.click()}
                        className={`border border-dashed rounded-2xl cursor-pointer py-10 flex flex-col items-center justify-center gap-3 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-primary"}`}
                    >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                            <ImageIcon />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm text-center">
                                <span className="font-semibold text-foreground underline">Click here to upload</span> or drag and drop
                            </p>
                            <p className="text-xs! font-medium">PNG, JPG (max. 1440×900px)</p>
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
                <div className="space-y-1.5">
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
                    <p>
                        Example: https://www.youtube.com/watch?v=8T7SnBQDiuM
                    </p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" className="md:min-w-30" onClick={onBack}>Previous</Button>
                    <Button type="submit" className="md:min-w-30">Next</Button>
                </div>
            </FormCard>
        </form>
    );
});

export default MediaForm;

