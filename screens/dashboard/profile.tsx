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
import { useUserStore } from "@/app/stores/user-store"; // Imported user store

const UPDATE_REALTOR_MUTATION = `
  mutation UpdateRealtor($id: String!, $input: JSONObject!, $realtor_pic: Upload) {
    updateRealtor(id: $id, input: $input, realtor_pic: $realtor_pic)
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

export default function ProfileScreen() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const { user } = useUserStore(); // Pulled current user from user-store
    const realtorId = user?.id;

    const [activeTab, setActiveTab] = React.useState<TabType>(
        (searchParams.get('tab') as TabType) || 'profile'
    );
    const [isPending, setIsPending] = React.useState(false);

    const { handleQueryParamsChange } = useQueryParams();

    const handleTabChange = (targetTab: string) => {
        const cleanTarget = targetTab as TabType;
        setActiveTab(cleanTarget);
        handleQueryParamsChange('tab', cleanTarget);
    };

    const handleProfileSubmit = async (data: ProfileFormValues) => {
        if (!realtorId) {
            console.error("Realtor ID is missing");
            return;
        }

        setIsPending(true);

        try {
            const inputPayload = {
                full_name: data.full_name,
                mobile_number: data.mobile_number,
                whatsapp_number: data.whatsapp_number,
            };

            const response = await fetch('/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: UPDATE_REALTOR_MUTATION,
                    variables: {
                        id: realtorId,
                        input: inputPayload,
                        realtor_pic: data.realtor_pic || null,
                    },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                console.error("GraphQL errors:", result.errors);
            } else {
                console.log("Profile updated successfully:", result.data);
            }
        } catch (err) {
            console.error("Error executing profile update:", err);
        } finally {
            setIsPending(false);
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
                        initialData={{
                            full_name: user?.fullName || "",
                            email: user?.email || "",
                            mobile_number: user?.mobileNumber || "",
                            whatsapp_number: user?.whatsappNumber || "",
                            realtor_pic: user?.avatar || "",
                        }}
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