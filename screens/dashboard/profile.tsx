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
import React, { useEffect } from 'react';
import { useUserStore } from "@/app/stores/user-store";
import { axiosInstance } from "@/network/axios-instance";
import { toast } from "sonner";
import Cookies from "js-cookie";

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

// Helper function to resolve realtorId across state sources and cookie token
const resolveRealtorId = (user: any): string | null => {
    // 1. Direct property on user (if added to IUser)
    if (user?.realtorId) return user.realtorId;

    // 2. Nested realtor object (user.realtor.id)
    if (user?.realtor?.id) return user.realtor.id;

    // 3. Cookie fallback: Decode JWT token directly
    try {
        const token = Cookies.get("EzxqowpoqiaQa");
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload?.realtorId || null;
        }
    } catch (err) {
        console.error("Failed to decode token from cookie:", err);
    }

    return null;
};

export default function ProfileScreen() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const { user, setUser } = useUserStore();

    const [activeTab, setActiveTab] = React.useState<TabType>(
        (searchParams.get('tab') as TabType) || 'profile'
    );
    const [isPending, setIsPending] = React.useState(false);

    const { handleQueryParamsChange } = useQueryParams();

    // 🔍 Log the active user state on mount / change to inspect store hydration
    useEffect(() => {
        console.log("🔍 Current User Object in Store:", user);
    }, [user]);

    const handleTabChange = (targetTab: string) => {
        const cleanTarget = targetTab as TabType;
        setActiveTab(cleanTarget);
        handleQueryParamsChange('tab', cleanTarget);
    };

    const handleProfileSubmit = async (data: ProfileFormValues) => {
        const targetRealtorId = resolveRealtorId(user);

        if (!targetRealtorId) {
            toast.error("Realtor profile ID not found! Please sign in again.");
            return;
        }

        setIsPending(true);

        try {
            const response = await axiosInstance.post("/graphql", {
                query: UPDATE_REALTOR_MUTATION,
                variables: {
                    id: targetRealtorId,
                    input: {
                        full_name: data.full_name,
                        mobile_number: data.mobile_number,
                        whatsapp_number: data.whatsapp_number,
                    },
                    realtor_pic: data.realtor_pic || null,
                },
            });

            if (response.data?.errors) {
                toast.error(response.data.errors[0]?.message || "Failed to update profile");
            } else {
                toast.success("Profile updated successfully!");

                // 💡 FIX: Sync local store with the newly updated fields
                if (user) {
                    setUser({
                        ...user,
                        fullName: data.full_name,
                        mobileNumber: data.mobile_number,
                        whatsappNumber: data.whatsapp_number,
                    });
                }
            }
        } catch (err: any) {
            console.error("Error updating profile:", err);
            toast.error(err?.message || "Failed to update profile");
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
                            mobile_number: user?.mobileNumber || user?.realtor?.mobile_number || "",
                            whatsapp_number: user?.whatsappNumber || user?.realtor?.whatsapp_number || "",
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