"use client";

import BasicInformationForm, { BasicFormHandle } from '@/components/dashboard/create-listing/basic-information-form';
import LocationForm from '@/components/dashboard/create-listing/location-form';
import MediaForm, { MediaFormHandle } from '@/components/dashboard/create-listing/media-form';
import DashboardNavbar from '@/components/dashboard/dashboard-navbar'
import DashboardPageContainer from '@/components/dashboard/dashboard-page-container'
import { Button } from '@/components/ui/button'
import CustomTab from '@/components/universal/custom-tab'
import { useQueryParams } from '@/hooks/useQueryParams'
import { BasicListingData, LocationListingData, MediaListingData, createListing } from '@/network/listings'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

const tabOptions = [
    { name: 'Basic', value: 'basic' },
    { name: 'Media', value: 'media' },
    { name: 'Location', value: 'location' },
]

const TAB_ORDER = ['basic', 'media', 'location'] as const;
type TabType = typeof TAB_ORDER[number];

export default function CreateListingScreen() {
    const searchParams = useSearchParams();
    const router = useRouter()

    const [activeTab, setActiveTab] = React.useState<TabType>(
        (searchParams.get('tab') as TabType) || 'basic'
    )
    const [isPending, setIsPending] = React.useState(false)

    const { handleQueryParamsChange } = useQueryParams()

    const basicFormRef = React.useRef<BasicFormHandle>(null)
    const mediaFormRef = React.useRef<MediaFormHandle>(null)

    const draftRef = React.useRef<{
        basic: BasicListingData | null
        media: MediaListingData | null
    }>({ basic: null, media: null })

    React.useEffect(() => {
        const handleMobileDraftTrigger = () => {
            handleSaveDraft();
        };

        window.addEventListener('trigger-save-draft', handleMobileDraftTrigger);
        return () => {
            window.removeEventListener('trigger-save-draft', handleMobileDraftTrigger);
        };
    }, []);

    // Step 1: Define the Validation Logic Per Tab using live values
    const isTabValid = (tabId: TabType): boolean => {
        // 🚀 ALWAYS pull fresh, live values directly from the active form references if they exist
        const liveBasicValues = basicFormRef.current?.getValues?.() || null;
        const liveMediaValues = mediaFormRef.current?.getValues?.() || null;

        // Fallback to the draft cache only if the form component isn't rendered/mounted yet
        const basic = liveBasicValues || draftRef.current.basic;
        const media = liveMediaValues || draftRef.current.media;

        switch (tabId) {
            case 'basic':
                return !!(
                    basic?.title &&
                    basic?.property_category &&
                    basic?.property_type &&
                    basic?.status &&
                    basic?.price?.amount
                );
            case 'media':
                return !!(media?.images && media.images.length > 0);
            case 'location':
                return true;
            default:
                return false;
        }
    };

    // Step 2 & 3: Guarded Tab Change Interceptor for both Header Tabs and Next Buttons
    const handleTabChange = (targetTab: string) => {
        const cleanTarget = targetTab as TabType;
        const currentIdx = TAB_ORDER.indexOf(activeTab)
        const targetIdx = TAB_ORDER.indexOf(cleanTarget)

        // 1. Moving Forward: Ensure current tab is completed before moving forward
        if (targetIdx > currentIdx) {
            // Check if Basic is valid if we are trying to go past it (to Media or Location)
            if (targetIdx > 0 && !isTabValid('basic')) {
                toast.error("The Basic Information tab is incomplete. Please fill out all essential fields.");
                setActiveTab('basic');
                handleQueryParamsChange('tab', 'basic');
                return; // 🛑 Block execution
            }
            
            // Check if Media is valid if we are trying to jump straight to Location
            if (cleanTarget === 'location' && !isTabValid('media')) {
                toast.error("The Media tab is incomplete. Please upload at least one image.");
                setActiveTab('media');
                handleQueryParamsChange('tab', 'media');
                return; // 🛑 Block execution
            }
        }

        // 2. Allow backward navigation or forward movement if validation passed
        setActiveTab(cleanTarget)
        handleQueryParamsChange('tab', cleanTarget)
    }

    // Capture validated data payloads from standard child form actions
    const handleBasicNext = (data: BasicListingData) => {
        draftRef.current.basic = data
        handleTabChange('media')
    }

    const handleMediaNext = (data: MediaListingData) => {
        draftRef.current.media = data
        handleTabChange('location')
    }

    const handleLocationSubmit = async (data: LocationListingData, submit: boolean) => {
        const { basic, media } = draftRef.current
        
        if (!submit) {
            setIsPending(true)
            try {
                const mediaData: MediaListingData = media ?? { images: [], cover_index: 0, video_url: '' }
                await createListing((basic ?? {}) as BasicListingData, mediaData, data, false)
                
                toast.success('Draft saved successfully!')
                router.push('/dashboard')
                return
            } catch (err) {
                toast.error('Failed to save draft.')
                return
            } finally {
                setIsPending(false)
            }
        }

        setIsPending(true)
        try {
            await createListing(basic as BasicListingData, media as MediaListingData, data, true)
            toast.success('Listing submitted for review!')
            router.push('/dashboard')
        } catch (err: any) {
            const backendErrors = err?.response?.data?.errors;
            if (Array.isArray(backendErrors) && backendErrors.length > 0) {
                const firstError = backendErrors[0];
                toast.error(firstError.message)
                handleTabChange(firstError.tab);
            } else {
                toast.error(err instanceof Error ? err.message : 'Failed to submit listing. Please verify all entries.')
            }
        } finally {
            setIsPending(false)
        }
    }

    const handleSaveDraft = async () => {
        const basic = draftRef.current.basic ?? basicFormRef.current?.getValues() ?? null
        const media = draftRef.current.media ?? mediaFormRef.current?.getValues() ?? null

        if (!basic) {
            toast.error('Please fill in the basic information first.')
            return
        }

        setIsPending(true)
        try {
            const mediaData: MediaListingData = media ?? { images: [], cover_index: 0, video_url: '' }
            await createListing(basic as BasicListingData, mediaData, null, false)
            toast.success('Listing saved as draft!')
            router.push('/dashboard')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save draft.')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <DashboardNavbar pageTitle="Create Listing">
                <Button className="hidden md:inline-flex" onClick={handleSaveDraft} disabled={isPending}>
                    Save as draft
                </Button>
            </DashboardNavbar>
            <DashboardPageContainer>
                {/* 1. Wired into CustomTab layout wrapper */}
                <CustomTab
                    items={tabOptions}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
                
                <div className={activeTab !== 'basic' ? 'hidden' : ''}>
                    <BasicInformationForm ref={basicFormRef} onNext={handleBasicNext} />
                </div>
                
                <div className={activeTab !== 'media' ? 'hidden' : ''}>
                    <MediaForm
                        ref={mediaFormRef}
                        onNext={handleMediaNext}
                        onBack={() => handleTabChange('basic')}
                    />
                </div>
                
                <div className={activeTab !== 'location' ? 'hidden' : ''}>
                    <LocationForm
                        onFormSubmit={handleLocationSubmit}
                        isPending={isPending}
                        onBack={() => handleTabChange('media')}
                    />
                </div>
            </DashboardPageContainer>
        </>
    )
}