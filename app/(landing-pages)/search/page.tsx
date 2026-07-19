'use client';

import React from "react";
import { useSearchParams } from "next/navigation";
import SearchResultsPage from "@/screens/public-pages/search";

export default function Page() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || searchParams.get("location") || "";

    return (
        <main className="w-full min-h-screen bg-neutral-50 pt-6">
            <SearchResultsPage initialSearchTerm={search} />
        </main>
    );
}