'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchResultsPage from "@/screens/public-pages/search";

function SearchContent() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || searchParams.get("location") || "";

    return <SearchResultsPage initialSearchTerm={search} />;
}

export default function Page() {
    return (
        <main className="w-full min-h-screen bg-neutral-50 pt-6">
            <Suspense fallback={
                <div className="py-12 text-center text-neutral-500 font-medium">
                    Loading search results...
                </div>
            }>
                <SearchContent />
            </Suspense>
        </main>
    );
}