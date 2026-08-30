"use client";

import BasicInformationForm, { BasicFormHandle } from '@/components/dashboard/create-listing/basic-information-form';
import LocationForm, { LocationFormHandle } from '@/components/dashboard/create-listing/location-form';
import MediaForm, { MediaFormHandle } from '@/components/dashboard/create-listing/media-form';
import DashboardNavbar from '@/components/dashboard/dashboard-navbar';
import DashboardPageContainer from '@/components/dashboard/dashboard-page-container';
import { Button } from '@/components/ui/button';
import CustomTab from '@/components/universal/custom-tab';
import { useQueryParams } from '@/hooks/useQueryParams';
import { BasicListingData, LocationListingData, MediaListingData, uploadImages, submitListing } from '@/network/listings';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { gqlRequest } from '@/network/graphql-client';

const tabOptions = [
    { name: 'Basic', value: 'basic' },
    { name: 'Media', value: 'media' },
    { name: 'Location', value: 'location' },
];

const TAB_ORDER = ['basic', 'media', 'location'] as const;
type TabType = typeof TAB_ORDER[number];

const toTitleCase = (str: string) => str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

const GET_LISTING_FOR_EDIT_QUERY = `
    query GetListingForEdit($id: String!) {
        getListingForEdit(id: $id)
    }
`;

const UPDATE_LISTING_MUTATION = `
    mutation UpdateListing($id: String!, $input: JSONObject!) {
        updateListing(id: $id, input: $input)
    }
`;

export default function EditListingScreen() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const listingId = params?.id as string;

    const [activeTab, setActiveTab] = React.useState<TabType>(
        (searchParams.get('tab') as TabType) || 'basic'
    );
    const [isLoading, setIsLoading] = React.useState(true);
    const [isPending, setIsPending] = React.useState(false);

    const { handleQueryParamsChange } = useQueryParams();

    const basicFormRef = React.useRef<BasicFormHandle>(null);
    const mediaFormRef = React.useRef<MediaFormHandle>(null);
    const locationFormRef = React.useRef<LocationFormHandle>(null);
    
    const [basicInitial, setBasicInitial] = React.useState<BasicListingData | null>(null);
    const [mediaInitial, setMediaInitial] = React.useState<MediaListingData | null>(null);
    const [liveLocationData, setLiveLocationData] = React.useState<any>(null);

    const draftRef = React.useRef<{
        basic: BasicListingData | null;
        media: MediaListingData | null;
    }>({ basic: null, media: null });

    React.useEffect(() => {
        if (!listingId) return;

        async function fetchListingDetails() {
            try {
                setIsLoading(true);

                const data = await gqlRequest<{ getListingForEdit: any }>(
                    GET_LISTING_FOR_EDIT_QUERY, 
                    { id: listingId }
                );

                const rawListing = data?.getListingForEdit;

                if (!rawListing) {
                    throw new Error("Listing payload empty or access denied.");
                }

                // 1. Invert GeoJSON [Lng, Lat] back to Leaflet [Lat, Lng]
                const rawCoords = rawListing.location?.coordinates;
                const safeCoordinates: [number, number] = 
                    Array.isArray(rawCoords) && rawCoords.length === 2 && !rawCoords.some(isNaN)
                        ? [Number(rawCoords[1]), Number(rawCoords[0])]
                        : [5.0377, 7.9128];

                const listingLocation = rawListing.location ? {
                    address: rawListing.location.address || "",
                    state: toTitleCase(rawListing.location.state || ""),
                    city: toTitleCase(rawListing.location.city || ""),
                    landmark: rawListing.location.landmark || "",
                    coordinates: safeCoordinates
                } : {
                    address: "",
                    state: "",
                    city: "",
                    landmark: "",
                    coordinates: [5.0377, 7.9128] as [number, number]
                };

                // 2. Safe Price Scalar Extraction
                const rawPrice = rawListing.price;
                const extractedPrice = typeof rawPrice === 'object' && rawPrice !== null 
                    ? rawPrice.amount 
                    : rawPrice;

                const parsedBasic: any = {
                    title: rawListing.title || "",
                    description: rawListing.description || "",
                    property_category: rawListing.property_category || "",
                    property_type: rawListing.property_type || "",
                    status: rawListing.status || "",
                    price: {
                        amount:
                        typeof rawListing.price === "object" && rawListing.price !== null
                            ? Number(rawListing.price.amount ?? 0)
                            : Number(rawListing.price ?? 0),
                        per:
                        typeof rawListing.price === "object" && rawListing.price !== null
                            ? rawListing.price.per || ""
                            : "",
                    },
                    details: {
                        bedroom: rawListing.details?.bedroom ?? 0,
                        bathroom: rawListing.details?.bathroom ?? 0,
                        living_room: rawListing.details?.living_room ?? 0,
                        land_area: rawListing.details?.land_area ?? "",
                        parking_space: rawListing.details?.parking_space ?? 0,
                        features: rawListing.details?.features || [],
                    },
                };

                // 3. Media Extraction
                const mappedImages = Array.isArray(rawListing.images)
                    ? rawListing.images.map((img: any) => typeof img === 'string' ? img : img.url)
                    : [];

                const parsedMedia: MediaListingData = {
                    images: mappedImages.length > 0 ? mappedImages : (rawListing.cover_image ? [rawListing.cover_image] : []),
                    cover_index: rawListing.cover_index || 0,
                    video_url: rawListing.video || rawListing.video_url || "",
                };

                // Populate Controlled React State to guarantee sub-form reactivity
                setBasicInitial(parsedBasic);
                setMediaInitial(parsedMedia);
                setLiveLocationData(listingLocation);

                // Initialize draft backup
                draftRef.current.basic = parsedBasic;
                draftRef.current.media = parsedMedia;

            } catch (err: any) {
                let errorMessage = "Failed to load listing details.";
                if (err?.message) errorMessage = err.message;
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchListingDetails();
    }, [listingId]);

    React.useEffect(() => {
        if (!listingId) return;

        const onNavbarSave = () => {
            const loc = locationFormRef.current?.getValues?.() ?? undefined;
            void handleLocationSubmit(loc, false);
        };

        window.addEventListener("trigger-navbar-save", onNavbarSave);
        window.addEventListener("trigger-save-draft", onNavbarSave);

        return () => {
            window.removeEventListener("trigger-navbar-save", onNavbarSave);
            window.removeEventListener("trigger-save-draft", onNavbarSave);
        };
        }, [listingId]);

    const isTabValid = (tabId: TabType, submittedLocationData?: any): boolean => {
        const liveBasicValues = basicFormRef.current?.getValues?.() || null;
        const liveMediaValues = mediaFormRef.current?.getValues?.() || null;

        const basic = liveBasicValues || draftRef.current.basic || basicInitial;
        const media = liveMediaValues || draftRef.current.media || mediaInitial;
        const location = submittedLocationData || liveLocationData; 

        switch (tabId) {
            case 'basic':
                return !!(basic?.title && basic?.property_category && basic?.property_type && basic?.status && basic?.price);
            case 'media':
                return !!(media?.images && media.images.length > 0);
            case 'location':
                const targetLoc = location?.location || location;
                return !!(targetLoc?.address && targetLoc?.state);
            default:
                return false;
        }
    };

    const handleTabChange = (targetTab: string) => {
        const cleanTarget = targetTab as TabType;
        const currentIdx = TAB_ORDER.indexOf(activeTab);
        const targetIdx = TAB_ORDER.indexOf(cleanTarget);

        if (targetIdx > currentIdx) {
            if (targetIdx > 0 && !isTabValid('basic')) {
                toast.error("Please fill out all mandatory basic fields.");
                setActiveTab('basic');
                handleQueryParamsChange('tab', 'basic');
                return; 
            }
            if (cleanTarget === 'location' && !isTabValid('media')) {
                toast.error("Please upload at least one image.");
                setActiveTab('media');
                handleQueryParamsChange('tab', 'media');
                return; 
            }
        }

        setActiveTab(cleanTarget);
        handleQueryParamsChange('tab', cleanTarget);
    };

    const handleLocationSubmit = async (data?: LocationListingData | any, submit: boolean = true,) => {
        const liveBasic = basicFormRef.current?.getValues?.();
        const liveMedia = mediaFormRef.current?.getValues?.();

        const basic = liveBasic || draftRef.current.basic || basicInitial;
        const media = liveMedia || draftRef.current.media || mediaInitial;
        const effectiveLocation = data || liveLocationData;

        if (submit && !isTabValid('location', effectiveLocation)) {
            toast.error("Please fill out all required location fields.");
            return;
        }

        if (!basic) {
            toast.error('Please complete basic property information first.');
            return;
        }

        const allImages = media?.images || [];
        const newFiles = allImages.filter((img: any) => img instanceof File);
        const existingImages = allImages
            .filter(
            (img: any) =>
                !(img instanceof File) &&
                (typeof img === "string" || (img && typeof img.url === "string")),
            )
            .map((img: any) =>
            typeof img === "string" ? { url: img } : { url: img.url, publicId: img.publicId },
            );

        setIsPending(true);
        try {
            const locObj = effectiveLocation?.location || effectiveLocation;

            const updateInput = {
                title: basic.title || "Untitled Listing",
                description: basic.description || "",
                property_category: basic.property_category,
                property_type: basic.property_type,
                status: basic.status,
                price: {
                    amount: Number(
                    typeof basic.price === "object" ? basic.price?.amount : basic.price,
                    ),
                    per: typeof basic.price === "object" ? basic.price?.per || "" : "",
                },
                details: basic.details || {},
                images: existingImages,
                video: media?.video_url || "",
                location: {
                    address: locObj?.address,
                    state: locObj?.state,
                    city: locObj?.city,
                    landmark: locObj?.landmark,
                    coordinates:
                    Array.isArray(locObj?.coordinates) && locObj.coordinates.length === 2
                        ? [Number(locObj.coordinates[1]), Number(locObj.coordinates[0])]
                        : undefined,
                },
            };

            await gqlRequest(UPDATE_LISTING_MUTATION, {
                id: listingId,
                input: updateInput,
            });

            if (newFiles.length > 0) {
                await uploadImages(listingId, newFiles);
            }

            if (submit) {
                await submitListing(listingId);
            }

            toast.success(
                submit ? "Listing submitted successfully!" : "Edits saved successfully!",
            );
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to save updates.");
        } finally {
            setIsPending(false);
        }
        };

    if (isLoading) {
        return (
            <DashboardPageContainer>
                <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-neutral-800">Retrieving listing record...</p>
                </div>
            </DashboardPageContainer>
        );
    }

    return (
        <>
            <DashboardNavbar pageTitle="Edit Listing">
                <Button
                    className="hidden md:inline-flex"
                    onClick={() => {
                        const loc = locationFormRef.current?.getValues() ?? undefined;
                        handleLocationSubmit(loc, false);
                    }}
                    disabled={isPending}
                >
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </DashboardNavbar>
            <DashboardPageContainer>
                <CustomTab items={tabOptions} activeTab={activeTab} onTabChange={handleTabChange} />
                
                <div className={activeTab !== 'basic' ? 'hidden' : ''}>
                    <BasicInformationForm 
                        ref={basicFormRef} 
                        onFormSubmit={(data) => {
                            draftRef.current.basic = data;
                            handleTabChange('media');
                        }} 
                        initialData={basicInitial || undefined}
                    />
                </div>
                
                <div className={activeTab !== 'media' ? 'hidden' : ''}>
                    <MediaForm
                        ref={mediaFormRef}
                        onNext={(data) => {
                            draftRef.current.media = data;
                            handleTabChange('location');
                        }}
                        onBack={() => handleTabChange('basic')}
                        initialData={mediaInitial || undefined}
                        isPending={isPending}
                    />
                </div>
                
                <div className={activeTab !== 'location' ? 'hidden' : ''}>
                    <LocationForm
                        ref={locationFormRef}
                        onFormSubmit={handleLocationSubmit}
                        isPending={isPending}
                        onBack={() => handleTabChange("media")}
                        initialData={liveLocationData || undefined}
                    />
                </div>
            </DashboardPageContainer>
        </>
    );
}