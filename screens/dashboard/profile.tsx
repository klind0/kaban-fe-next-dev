"use client";

import DashboardNavbar from '@/components/dashboard/dashboard-navbar';
import DashboardPageContainer from '@/components/dashboard/dashboard-page-container';
import ProfileForm, { ProfileFormValues } from "@/components/dashboard/profile/profile-form";
import SocialMediaForm from '@/components/dashboard/profile/social-media-form';
import PasswordForm from '@/components/dashboard/profile/password-form';
import VerificationForm from '@/components/dashboard/profile/verification-form';
import DeactivateAccountForm from '@/components/dashboard/profile/deactivate-account-form';
import CustomTab from '@/components/universal/custom-tab';
import { Button } from '@/components/ui/button';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

// Apollo / GraphQL
import { gql, useMutation } from '@apollo/client';
import { toast } from 'sonner'; // Or your preferred toast notification library

// Define the mutation based on your RealtorResolver signature
const UPDATE_REALTOR = gql`
  mutation UpdateRealtor($id: String!, $input: JSONObject!) {
    updateRealtor(id: $id, input: $input)
  }
`;

const tabOptions = [
    { name: 'Profile', value: 'profile' },
    { name: 'Social Media', value: 'social-media' },
    { name: 'Password', value: 'password' },
    { name: 'Verification', value: 'verification' },
    { name: 'Deactivate Account', value: 'deactivate-account' },
];

type TabType = 'profile' | 'social-media' | 'password' | 'verification' | 'deactivate-account';

interface ProfileScreenProps {
    realtorId?: string;
}

export default function ProfileScreen({ realtorId }: ProfileScreenProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = React.useState<TabType>(
        (searchParams.get('tab') as TabType) || 'profile'
    );

    const { handleQueryParamsChange } = useQueryParams();

    // Apollo mutation hook setup
    const [updateRealtorMutation, { loading: isPending }] = useMutation(UPDATE_REALTOR, {
        onCompleted: () => {
            toast.success("Profile updated successfully!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update profile. Please try again.");
        },
    });

    const handleTabChange = (targetTab: string) => {
        const cleanTarget = targetTab as TabType;
        setActiveTab(cleanTarget);
        handleQueryParamsChange('tab', cleanTarget);
    };

    const handleProfileSubmit = async (data: ProfileFormValues) => {
        if (!realtorId) {
            toast.error("Realtor ID not found. Unable to update profile.");
            return;
        }

        try {
            await updateRealtorMutation({
                variables: {
                    id: realtorId,
                    input: {
                        bio: data.bio,
                        company: data.company_name,
                        office_address: data.address,
                        mobile_number: data.phone_number,
                    },
                },
            });
        } catch (err) {
            console.error("Profile mutation error:", err);
        }
    };

    return (
        <>
            <DashboardNavbar pageTitle="Profile">
                <Button 
                    className="hidden md:inline-flex" 
                    onClick={() => router.push('/dashboard/create-listing')}
                >
                    Create listing
                </Button>
            </DashboardNavbar>
            
            <DashboardPageContainer>
                <CustomTab
                    items={tabOptions}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                <div className={activeTab !== 'profile' ? 'hidden' : ''}>
                    <ProfileForm 
                        onFormSubmit={handleProfileSubmit} 
                        isPending={isPending}
                    />
                </div>

                <div className={activeTab !== 'social-media' ? 'hidden' : ''}>
                    <SocialMediaForm />
                </div>

                <div className={activeTab !== 'password' ? 'hidden' : ''}>
                    <PasswordForm />
                </div>

                <div className={activeTab !== 'verification' ? 'hidden' : ''}>
                    <VerificationForm />
                </div>

                <div className={activeTab !== 'deactivate-account' ? 'hidden' : ''}>
                    <DeactivateAccountForm />
                </div>
            </DashboardPageContainer>
        </>
    );
}