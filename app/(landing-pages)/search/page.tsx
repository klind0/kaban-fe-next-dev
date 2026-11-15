'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchResultsPage from "@/screens/public-pages/search";
import { Skeleton } from "@/components/ui/skeleton";
import SearchResultsSkeleton from "@/screens/public-pages/search/components/SearchResultsSkeleton";

function SearchContent() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || searchParams.get("location") || "";

    return <SearchResultsPage initialSearchTerm={search} />;
}

export default function Page() {
    return (
        <main className="w-full min-h-screen bg-neutral-50 pt-6">
            <Suspense fallback={
                <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-72 max-w-full" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <SearchResultsSkeleton />
                </div>
            }>
                <SearchContent />
            </Suspense>
        </main>
    );
}