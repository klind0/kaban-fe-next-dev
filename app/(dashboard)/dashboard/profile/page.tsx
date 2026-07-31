import ProfileScreen from "@/screens/dashboard/profile";
import React from "react";

export default function ProfilePage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ProfileScreen />
        </React.Suspense>
    );
}