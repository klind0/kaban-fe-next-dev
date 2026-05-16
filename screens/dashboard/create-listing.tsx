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

const TAB_ORDER = ['basic', 'media', 'location']

export default function CreateListingScreen() {
    const searchParams = useSearchParams();
    const router = useRouter()

    const [activeTab, setActiveTab] = React.useState<string>(searchParams.get('tab') || 'basic')
    const [isPending, setIsPending] = React.useState(false)

    const { handleQueryParamsChange } = useQueryParams()

    const basicFormRef = React.useRef<BasicFormHandle>(null)
    const mediaFormRef = React.useRef<MediaFormHandle>(null)

    const draftRef = React.useRef<{
        basic: BasicListingData | null
        media: MediaListingData | null
    }>({ basic: null, media: null })

    // Validates current step before allowing a tab change header click
    const handleTabChange = async (targetTab: string) => {
        const currentIdx = TAB_ORDER.indexOf(activeTab)
        const targetIdx = TAB_ORDER.indexOf(targetTab)

        // Moving backward is always allowed
        if (targetIdx <= currentIdx) {
            setActiveTab(targetTab)
            handleQueryParamsChange('tab', targetTab)
            return
        }

        // If trying to jump straight to Location from Basic, make sure they pass through Media first
        if (activeTab === 'basic' && targetTab === 'location') {
            const isBasicValid = await triggerFormSubmit(basicFormRef)
            if (!isBasicValid) return; // Blocked at Basic
            
            // If Basic passed but Media draft is empty, redirect them safely to Media instead of Location
            if (!draftRef.current.media) {
                toast.info('Please complete the Media step before proceeding to Location.')
                setActiveTab('media')
                handleQueryParamsChange('tab', 'media')
                return
            }
        }

        // If jumping forward from Basic to Media
        if (activeTab === 'basic' && targetTab === 'media') {
            const isValid = await triggerFormSubmit(basicFormRef)
            if (!isValid) return
        }

        // If jumping forward from Media to Location
        if (activeTab === 'media' && targetTab === 'location') {
            const isValid = await triggerFormSubmit(mediaFormRef)
            if (!isValid) return
        }

        setActiveTab(targetTab)
        handleQueryParamsChange('tab', targetTab)
    }

    // Helper function to programmatically trigger standard form validation/submission 
    // utilizing the refs setup inside your child forms
    const triggerFormSubmit = async (ref: React.RefObject<any>): Promise<boolean> => {
        if (ref.current && typeof ref.current.submitForm === 'function') {
            return await ref.current.submitForm()
        }
        // Fallback check if submitForm helper isn't fully async or exported
        if (ref.current && typeof ref.current.getValues === 'function') {
            const values = ref.current.getValues()
            return !!values
        }
        return false
    }

    const goToTab = (tab: string) => {
        setActiveTab(tab)
        handleQueryParamsChange('tab', tab)
    }

    const handleBasicNext = (data: BasicListingData) => {
        draftRef.current.basic = data
        const idx = TAB_ORDER.indexOf('basic')
        goToTab(TAB_ORDER[idx + 1])
    }

    const handleMediaNext = (data: MediaListingData) => {
        draftRef.current.media = data
        const idx = TAB_ORDER.indexOf('media')
        goToTab(TAB_ORDER[idx + 1])
    }

    const handleLocationSubmit = async (data: LocationListingData, submit: boolean) => {
        const { basic, media } = draftRef.current
        if (!basic || !media) {
            toast.error('Please fill in the previous steps first.')
            return
        }
        setIsPending(true)
        try {
            await createListing(basic, media, data, submit)
            toast.success(submit ? 'Listing submitted for review!' : 'Draft saved successfully!')
            router.push('/dashboard')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save listing. Please try again.')
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
            await createListing(basic, mediaData, null, false)
            toast.success('Draft saved!')
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
                        onBack={() => goToTab('basic')}
                    />
                </div>
                <div className={activeTab !== 'location' ? 'hidden' : ''}>
                    <LocationForm
                        onFormSubmit={handleLocationSubmit}
                        isPending={isPending}
                        onBack={() => goToTab('media')}
                    />
                </div>
            </DashboardPageContainer>
        </>
    )
}