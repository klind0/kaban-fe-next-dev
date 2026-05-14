import AdvertSection from "@/components/universal/advert-section";
import ErrorToastHandler from "@/components/universal/error-toast-handler";
import Footer from "@/components/universal/footer";
import Navbar from "@/components/universal/navbar";
import React from "react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <React.Suspense>
                <ErrorToastHandler />
            </React.Suspense>
            <Navbar />
            <main className="mb-35">
                {children}
                <AdvertSection />
            </main>
            <Footer />
        </>
    );
}
