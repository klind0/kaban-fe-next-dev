"use client";

import BasicInformationForm, { BasicFormHandle } from '@/components/dashboard/create-listing/basic-information-form';
import LocationForm from '@/components/dashboard/create-listing/location-form';
import MediaForm, { MediaFormHandle } from '@/components/dashboard/create-listing/media-form';
import DashboardNavbar from '@/components/dashboard/dashboard-navbar';
import DashboardPageContainer from '@/components/dashboard/dashboard-page-container';
import { Button } from '@/components/ui/button';
import CustomTab from '@/components/universal/custom-tab';
import { useQueryParams } from '@/hooks/useQueryParams';
import { BasicListingData, LocationListingData, MediaListingData } from '@/network/listings';
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

// --- GraphQL Documents ---
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

                // Specify the expected GraphQL response type in the generic parameter
                const data = await gqlRequest<{ getListingForEdit: any }>(
                    GET_LISTING_FOR_EDIT_QUERY, 
                    { id: listingId }
                );

                const rawListing = data?.getListingForEdit;

                if (!rawListing) {
                    throw new Error("Listing payload empty or access denied.");
                }

                const listing = {
                    title: rawListing.title,
                    description: rawListing.description,
                    property_category: rawListing.property_category,
                    property_type: rawListing.property_type,
                    status: rawListing.status,
                    price: rawListing.price,
                    images: rawListing.images,
                    cover_image: rawListing.cover_image,
                    video: rawListing.video,
                    video_url: rawListing.video_url,
                    location: rawListing.location ? {
                        address: rawListing.location.address || "",
                        state: rawListing.location.state || "",
                        city: rawListing.location.city || "",
                        landmark: rawListing.location.landmark || "",
                        coordinates: Array.isArray(rawListing.location.coordinates) 
                            ? [...rawListing.location.coordinates] 
                            : [5.0377, 7.9128]
                    } : null
                };
                
                draftRef.current.basic = {
                    title: listing.title || "",
                    description: listing.description || "",
                    property_category: listing.property_category || "",
                    property_type: listing.property_type || "",
                    status: listing.status || "",
                    price: listing.price?.amount || listing.price || "",
                } as any; 

                const mappedImages = Array.isArray(listing.images)
                    ? listing.images.map((img: any) => typeof img === 'string' ? img : img.url)
                    : [];

                draftRef.current.media = {
                    images: mappedImages.length > 0 ? mappedImages : (listing.cover_image ? [listing.cover_image] : []),
                    cover_index: rawListing.cover_index || 0,
                    video_url: listing.video || listing.video_url || "",
                };

                setLiveLocationData({
                    location: listing.location || { address: "", state: "", city: "", landmark: "", coordinates: [5.0377, 7.9128] }
                });

            } catch (err: any) {
                // 🚀 STACK OVERFLOW FIX: Force extract a strict string primitive 
                // to prevent circular error objects from choking React state / toast.error
                let errorMessage = "Failed to load listing configuration details.";

                if (typeof err === "string") {
                    errorMessage = err;
                } else if (err?.message && typeof err.message === "string") {
                    errorMessage = err.message;
                } else if (err?.errors && Array.isArray(err.errors) && err.errors[0]?.message) {
                    errorMessage = String(err.errors[0].message);
                }

                console.error("❌ Isolated Prefill Error Text:", errorMessage);
                
                // Safely alert the UI using only a sanitized string
                toast.error(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchListingDetails();
    }, [listingId]);

    const scrollToMissingField = (inputName: string) => {
        const element = document.querySelector(`[name="${inputName}"]`) || 
                        document.querySelector(`[name$="${inputName}"]`);
        
        if (element) {
            const wrapper = element.closest('.form-control') || element.closest('div') || element;
            
            setTimeout(() => {
                wrapper.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center', 
                });
                
                if (typeof (element as HTMLElement).focus === 'function') {
                    (element as HTMLElement).focus({ preventScroll: true });
                }
            }, 100);
        }
    };

    const isTabValid = (tabId: TabType, submittedLocationData?: any): boolean => {
        const liveBasicValues = basicFormRef.current?.getValues?.() || null;
        const liveMediaValues = mediaFormRef.current?.getValues?.() || null;

        const basic = liveBasicValues || draftRef.current.basic;
        const media = liveMediaValues || draftRef.current.media;
        const location = submittedLocationData || liveLocationData; 

        switch (tabId) {
            case 'basic':
                if (!basic?.title) return false;
                if (!basic?.property_category) return false;
                if (!basic?.property_type) return false;
                if (!basic?.status) return false;
                if (!basic?.price) return false;
                return true;

            case 'media':
                if (!media?.images || media.images.length === 0) return false;
                return true;

            case 'location':
                const actualLocation = location?.location;
                if (!actualLocation?.address) {
                    toast.error("Please provide a property address.");
                    scrollToMissingField('address');
                    return false;
                }
                if (!actualLocation?.state) {
                    toast.error("Please select a state.");
                    scrollToMissingField('state');
                    return false;
                }
                return true;

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
                toast.error("Please fill out all essential fields before proceeding.");
                setActiveTab('basic');
                handleQueryParamsChange('tab', 'basic');
                return; 
            }

            if (cleanTarget === 'location' && !isTabValid('media')) {
                toast.error("The Media tab is incomplete. Please upload at least one image.");
                setActiveTab('media');
                handleQueryParamsChange('tab', 'media');
                return; 
            }
        }

        setActiveTab(cleanTarget);
        handleQueryParamsChange('tab', cleanTarget);
    };

    const handleBasicNext = (data: BasicListingData) => {
        draftRef.current.basic = data;
        handleTabChange('media');
    };

    const handleMediaNext = (data: MediaListingData) => {
        draftRef.current.media = data;
        handleTabChange('location');
    };

    const handleLocationSubmit = async (data: LocationListingData, submit: boolean) => {
        const basic = basicFormRef.current?.getValues() || draftRef.current.basic;
        const media = mediaFormRef.current?.getValues() || draftRef.current.media;
        
        setLiveLocationData(data);

        if (!basic) {
            toast.error("Please fill out essential fields on the Basic tab.");
            handleTabChange('basic');
            return;
        }

        if (submit && !isTabValid('location', data)) {
            return; 
        }

        setIsPending(true);
        try {
            const updateInput = {
                title: basic.title,
                description: basic.description,
                property_category: basic.property_category,
                property_type: basic.property_type,
                status: basic.status,
                price: typeof basic.price === 'object' ? basic.price : { amount: parseFloat(basic.price as any) },
                video: media?.video_url || "",
                location: {
                    address: data.location?.address,
                    state: data.location?.state,
                    city: data.location?.city,
                    landmark: data.location?.landmark,
                    coordinates: data.location?.coordinates || [5.0377, 7.9128]
                }
            };

            await gqlRequest<{ updateListing: any }>(
                UPDATE_LISTING_MUTATION, 
                {
                    id: listingId,
                    input: updateInput
                }
            );    
            
            toast.success(submit ? 'Listing updates published successfully!' : 'Changes successfully saved as draft!');
            router.push('/dashboard');
            router.refresh();
        } catch (err: any) {
            console.error("🔴 [CLIENT] CAUGHT EDIT MUTATION ERROR:", err);
            toast.error(err.message || 'Failed to save updates.');
        } finally {
            setIsPending(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardPageContainer>
                <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-neutral-800">Retrieving secure listing record...</p>
                </div>
            </DashboardPageContainer>
        );
    }

    return (
        <>
            <DashboardNavbar pageTitle="Edit Listing">
                <Button className="hidden md:inline-flex" onClick={() => handleLocationSubmit(liveLocationData, false)} disabled={isPending}>
                    {isPending ? "Saving..." : "Save edits"}
                </Button>
            </DashboardNavbar>
            <DashboardPageContainer>
                <CustomTab
                    items={tabOptions}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
                
                <div className={activeTab !== 'basic' ? 'hidden' : ''}>
                    <BasicInformationForm 
                        ref={basicFormRef} 
                        onFormSubmit={handleBasicNext} 
                        initialData={draftRef.current.basic || undefined}
                    />
                </div>
                
                <div className={activeTab !== 'media' ? 'hidden' : ''}>
                    <MediaForm
                        ref={mediaFormRef}
                        onNext={handleMediaNext}
                        onBack={() => handleTabChange('basic')}
                        initialData={draftRef.current.media || undefined}
                        isPending={isPending}
                    />
                </div>
                
                {/*<div className={activeTab !== 'location' ? 'hidden' : ''}>
                    <LocationForm
                        onFormSubmit={handleLocationSubmit}
                        isPending={isPending}
                        onBack={() => handleTabChange('media')}
                        initialData={liveLocationData?.location || undefined}
                    />
                </div> */}
            </DashboardPageContainer>
        </>
    );
}