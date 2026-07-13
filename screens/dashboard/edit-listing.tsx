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

const tabOptions = [
    { name: 'Basic', value: 'basic' },
    { name: 'Media', value: 'media' },
    { name: 'Location', value: 'location' },
];

const TAB_ORDER = ['basic', 'media', 'location'] as const;
type TabType = typeof TAB_ORDER[number];

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

    // Initialized as null, then fully populated from your server query on mount
    const draftRef = React.useRef<{
        basic: BasicListingData | null;
        media: MediaListingData | null;
    }>({ basic: null, media: null });

    // 1. Fetch existing listing record data on component mount
    React.useEffect(() => {
        if (!listingId) return;

        async function fetchListingDetails() {
            try {
                setIsLoading(true);
                // Replace with your actual GraphQL or network route hook payload wrapper:
                const response = await fetch(`/api/listings/${listingId}`);
                if (!response.ok) throw new Error("Could not fetch database records.");
                
                const data = await response.json();
                
                // Hydrate our active ref tracking memory slots
                draftRef.current.basic = data; 
                draftRef.current.media = {
                    images: data.images || data.media_urls || [],
                    cover_index: data.cover_index || 0,
                    video_url: data.video_url || "",
                };
                setLiveLocationData({
                    location: data.location
                });
            } catch (err) {
                console.error("❌ Error running prefill execution:", err);
                toast.error("Failed to load listing configuration details.");
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
            // 🚀 Replaced createListing call with your edit save mutation request
            const finalizedPayload = {
                ...basic,
                ...media,
                ...data,
                is_published: submit
            };

            const response = await fetch(`/api/listings/${listingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalizedPayload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData?.message || "Failed to submit updates.");
            }
            
            toast.success(submit ? 'Listing updates published!' : 'Changes saved as draft!');
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
                <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-2 animate-pulse">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-neutral-500">Loading original listing details...</p>
                </div>
            </DashboardPageContainer>
        );
    }

    return (
        <>
            <DashboardNavbar pageTitle="Edit Listing">
                <Button className="hidden md:inline-flex" onClick={() => handleLocationSubmit(liveLocationData, false)} disabled={isPending}>
                    Save modifications
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
                
                <div className={activeTab !== 'location' ? 'hidden' : ''}>
                    <LocationForm
                        onFormSubmit={handleLocationSubmit}
                        isPending={isPending}
                        onBack={() => handleTabChange('media')}
                        initialData={liveLocationData?.location || undefined}
                    />
                </div>
            </DashboardPageContainer>
        </>
    );
}