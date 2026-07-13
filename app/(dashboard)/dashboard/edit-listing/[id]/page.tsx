"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Form step components reused directly from your create-listing directory
import BasicInformationForm from "@/components/dashboard/create-listing/basic-information-form";
import LocationForm from "@/components/dashboard/create-listing/location-form";
import MediaForm from "@/components/dashboard/create-listing/media-form";

// Skeleton component for step changes or initial load
function EditStepSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse space-y-6">
            <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4" />
            <div className="h-8 bg-neutral-200 rounded w-1/2" />
            <div className="h-64 bg-neutral-200 rounded w-full mt-8" />
        </div>
    );
}

export default function EditListingWizardPage() {
    const params = useParams();
    const router = useRouter();
    const listingId = params?.id as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Master data storage payload matching your entire IListing schema structure
    const [listingData, setListingData] = useState<any>(null);
    const [backendErrors, setBackendErrors] = useState<any>(null);

    // 1. Fetch complete listing on mount from your GraphQL branch/API
    useEffect(() => {
        if (!listingId) return;

        async function loadListingPayload() {
            try {
                setIsLoading(true);
                // Adjust endpoint to match your GraphQL query or REST route
                const response = await fetch(`/api/listings/${listingId}`);
                if (!response.ok) throw new Error("Failed to pull listing payload.");
                
                const data = await response.json();
                setListingData(data);
            } catch (err) {
                console.error("Error loading listing for editing:", err);
            } finally {
                setIsLoading(false);
            }
        }

        loadListingPayload();
    }, [listingId]);

    // 2. Step Handlers that incrementally preserve changes locally
    const handleBasicNext = async (basicData: any) => {
        setListingData((prev: any) => ({ ...prev, ...basicData }));
        setCurrentStep(2);
    };

    const handleLocationSubmit = async (locationData: any) => {
        setListingData((prev: any) => ({ ...prev, ...locationData }));
        setCurrentStep(3);
    };

    // 3. Final submission handler sending the completed, updated object home
    const handleMediaNext = async (mediaData: any) => {
        try {
            setIsSubmitting(true);
            setBackendErrors(null);

            const finalizedPayload = {
                ...listingData,
                ...mediaData,
            };

            const response = await fetch(`/api/listings/${listingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalizedPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setBackendErrors(errorData.errors || errorData);
                return;
            }

            // Route user directly back onto their dashboard tabs upon completion
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            console.error("Critical error saving edited listing properties:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        } else {
            router.push("/dashboard");
        }
    };

    if (isLoading) return <EditStepSkeleton />;
    if (!listingData) return <div className="p-8 text-center text-red-500">Listing records could not be recovered.</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Context Header with clean progress metrics */}
            <div className="flex flex-col gap-1 border-b border-neutral-200 pb-5 mb-6">
                <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                    Edit Mode — Step {currentStep} of 3
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    {currentStep === 1 && "Basic Information"}
                    {currentStep === 2 && "Property Location"}
                    {currentStep === 3 && "Media Uploads & Assets"}
                </h1>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
                <BasicInformationForm
                    initialData={listingData} // Make sure your component handles this prop in its useForm `defaultValues`
                    onFormSubmit={handleBasicNext}
                    isPending={false}
                    onBack={handleBackStep}
                    externalErrors={backendErrors}
                />
            )}

            {/* Step 2: Media Uploads */}
            {currentStep === 3 && (
                <MediaForm
                    initialData={listingData.media || listingData} // Depending on your media schema shape
                    onFormSubmit={handleMediaNext}
                    isPending={isSubmitting}
                    onBack={handleBackStep}
                    externalErrors={backendErrors}
                />
            )}

            {/* Step 3: Location Information */}
            {currentStep === 2 && (
                <LocationForm
                    initialData={listingData.location}
                    onFormSubmit={handleLocationSubmit}
                    isPending={false}
                    onBack={handleBackStep}
                    externalErrors={backendErrors}
                />
            )}
        </div>
    );
}