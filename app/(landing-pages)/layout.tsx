import AdvertSection from "@/components/universal/advert-section";
import ErrorToastHandler from "@/components/universal/error-toast-handler";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/components/universal/footer";
import Navbar from "@/components/universal/navbar";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <div className="flex min-h-screen flex-col">
      <React.Suspense>
        <ErrorToastHandler />
      </React.Suspense>
      <Navbar />
      <main className="mb-35 flex-1">
        {children}
        <AdvertSection />
      </main>
      <Footer />
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </div>
  );
}