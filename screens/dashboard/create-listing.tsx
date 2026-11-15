"use client";

import BasicInformationForm, { BasicFormHandle } from '@/components/dashboard/create-listing/basic-information-form';
import LocationForm, { LocationFormHandle } from '@/components/dashboard/create-listing/location-form';
import MediaForm, { MediaFormHandle } from '@/components/dashboard/create-listing/media-form';
import DashboardNavbar from '@/components/dashboard/dashboard-navbar';
import DashboardPageContainer from '@/components/dashboard/dashboard-page-container';
import { Button } from '@/components/ui/button';
import CustomTab from '@/components/universal/custom-tab';
import { useQueryParams } from '@/hooks/useQueryParams';
import { BasicListingData, LocationListingData, MediaListingData, createListing } from '@/network/listings';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const tabOptions = [
    { name: 'Basic', value: 'basic' },
    { name: 'Media', value: 'media' },
    { name: 'Location', value: 'location' },
];

const TAB_ORDER = ['basic', 'media', 'location'] as const;
type TabType = typeof TAB_ORDER[number];

export default function CreateListingScreen() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = React.useState<TabType>(
        (searchParams.get('tab') as TabType) || 'basic'
    );
    const [isPending, setIsPending] = React.useState(false);
    const [pendingMessage, setPendingMessage] = React.useState("Processing...");

    const { handleQueryParamsChange } = useQueryParams();

    const basicFormRef = React.useRef<BasicFormHandle>(null);
    const mediaFormRef = React.useRef<MediaFormHandle>(null);
    const locationFormRef = React.useRef<LocationFormHandle>(null);
    
    const [liveLocationData, setLiveLocationData] = React.useState<any>(null);

    const draftRef = React.useRef<{
        basic: BasicListingData | null;
        media: MediaListingData | null;
    }>({ basic: null, media: null });

    React.useEffect(() => {
        const onNavbarSave = () => {
            void handleSaveDraft();
        };

        window.addEventListener("trigger-navbar-save", onNavbarSave);
        window.addEventListener("trigger-save-draft", onNavbarSave);

        return () => {
            window.removeEventListener("trigger-navbar-save", onNavbarSave);
            window.removeEventListener("trigger-save-draft", onNavbarSave);
        };
    }, []);

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
                toast.error("Please fill out all essential fields (Title, Category, Type, Status, Price) before proceeding.");
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
        // Prefer LIVE form values (same pattern as edit-listing)
        const basic =
            basicFormRef.current?.getValues?.() ||
            draftRef.current.basic ||
            null;

        const media =
            mediaFormRef.current?.getValues?.() ||
            draftRef.current.media ||
            null;

        setLiveLocationData(data);

        if (basic) draftRef.current.basic = basic;
        if (media) draftRef.current.media = media;

        const imageFiles = (media?.images || []).filter(
            (img): img is File => img instanceof File,
        );

        if (!basic) {
            toast.error("Please fill out essential fields on the Basic tab.");
            handleTabChange('basic');
            return;
        }

        if (submit && !isTabValid('location', data)) {
            return;
        }

        if (submit && imageFiles.length === 0) {
            toast.error("Please upload at least one image on the Media tab.");
            handleTabChange('media');
            return;
        }

        setPendingMessage(
            submit ? "Submitting listing..." : "Saving draft..."
        );
        setIsPending(true);
        try {
            await createListing(
                basic,
                {
                    images: imageFiles,
                    cover_index: media?.cover_index ?? 0,
                    video_url: media?.video_url || "",
                },
                data,
                submit,
            );

            toast.success(
                submit
                    ? 'Listing submitted for review. It will expire 30 days after it is published.'
                    : 'Draft saved successfully!',
            );
            router.push('/dashboard');
        } catch (err: any) {
            const backendErrors = err?.response?.data?.errors;

            if (Array.isArray(backendErrors) && backendErrors.length > 0) {
                const firstError = backendErrors[0];
                toast.error(firstError.message);
                handleTabChange(firstError.tab);
            } else {
                toast.error(
                    err?.message ||
                    (err instanceof Error ? err.message : 'Failed to process operation.')
                );
            }
        } finally {
            setIsPending(false);
        }
    };

    const resolveLocation = (): LocationListingData | null => {
        const fromForm = locationFormRef.current?.getValues?.() ?? null;
        if (fromForm?.location?.address || fromForm?.location?.state) {
            return fromForm;
        }

        if (liveLocationData?.location || liveLocationData?.address) {
            return liveLocationData.location
            ? liveLocationData
            : { location: liveLocationData };
        }
        return null;
    };

    const handleSaveDraft = async () => {
        const basic =
            basicFormRef.current?.getValues?.() ??
            draftRef.current.basic ??
            null;

        const media =
            mediaFormRef.current?.getValues?.() ??
            draftRef.current.media ??
            null;

        const location = resolveLocation();

        const imageFiles = (media?.images || []).filter(
            (img): img is File => img instanceof File,
        );

        if (!basic) {
            toast.error('Please fill in the basic information first.');
            return;
        }

        setPendingMessage("Saving draft...");
        setIsPending(true);
        try {
            await createListing(
                basic,
                {
                    images: imageFiles,
                    cover_index: media?.cover_index ?? 0,
                    video_url: media?.video_url || "",
                },
                location,
                false,
            );
            toast.success('Listing saved as draft!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err instanceof Error ? err.message : 'Failed to save draft.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <DashboardNavbar pageTitle="Create Listing">
                <Button className="hidden md:inline-flex" onClick={handleSaveDraft} disabled={isPending}>
                    Save as draft
                </Button>
            </DashboardNavbar>
            <DashboardPageContainer>
                <CustomTab
                    items={tabOptions}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
                <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    Listings expire 30 days after they are published following approval.
                </div>
                
                <div className={activeTab !== 'basic' ? 'hidden' : ''}>
                    <BasicInformationForm 
                        ref={basicFormRef} 
                        onFormSubmit={handleBasicNext} 
                    />
                </div>
                
                <div className={activeTab !== 'media' ? 'hidden' : ''}>
                    <MediaForm
                        ref={mediaFormRef}
                        onNext={handleMediaNext}
                        onBack={() => handleTabChange('basic')}
                        initialData={draftRef.current.media || undefined}
                    />
                </div>
                
                <div className={activeTab !== 'location' ? 'hidden' : ''}>
                    <LocationForm
                        ref={locationFormRef}
                        onFormSubmit={handleLocationSubmit}
                        isPending={isPending}
                        isActive={activeTab === 'location'}
                        onBack={() => handleTabChange('media')}
                    />
                </div>
            </DashboardPageContainer>

            {/* Full-screen loading overlay — keeps forms mounted */}
            {isPending && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 px-4 text-center backdrop-blur-sm">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="mt-3 w-full max-w-md">
                        <p className="text-sm font-medium text-neutral-800">
                            {pendingMessage}
                        </p>
                        <p className="mt-1 text-xs text-neutral-900">
                            This may take a moment while we process your images and details.
                        </p>
                        {pendingMessage === "Submitting listing..." && (
                            <p className="mt-2 text-sm font-medium text-neutral-800">
                                Listings expire 30 days after they are published following approval.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}