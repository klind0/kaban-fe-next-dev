import EditListingScreen from "@/screens/dashboard/edit-listing";
import React from "react";

export default function EditListingPage() {
    return (
        <React.Suspense fallback={<div className="p-8 text-center text-sm text-neutral-500">Loading layout...</div>}>
            <EditListingScreen />
        </React.Suspense>
    );
}