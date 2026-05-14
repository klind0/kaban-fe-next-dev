import CreateListingScreen from "@/screens/dashboard/create-listing";
import React from "react";

export default function CreateListingPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <CreateListingScreen />
        </React.Suspense>
    )
}
