import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookiesPolicy from "@/components/universal/cookies-policy";
import { Toaster } from "sonner";
import { InformationCircle } from "@/components/icons/information-circle";
import { TickCheck } from "@/components/icons/tick-circle";
import { Danger } from "@/components/icons/danger";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import Script from "next/script";
import GoogleAuthCallback from "@/components/auth/google-auth-callback";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kaban",
  description: "Smartest way to scout real estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-neutral-25`}
        suppressHydrationWarning
      >
        {/* 🌐 Google Maps Places API Script for Landmark Autocomplete */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />

        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              error: '!bg-[#FFEDED] !border-[#FFB8B7] !text-[#1A1A1A]',
              success: '!bg-[#E5FBEC] !border-[#66E78E] !text-[#1A1A1A]',
              warning: '!bg-[#FFF7E5] !border-[#FFD266] !text-[#1A1A1A]',
              info: '!bg-[#E9F5FF] !border-[#7AC5FF] !text-[#1A1A1A]',
            },
          }}
          icons={{
            error: <InformationCircle className="text-[#FF3B30]" />,
            success: <TickCheck className="text-[#04912D] size-4" />,
            warning: <Danger className="text-[#FFB400]" />,
            info: <InformationCircle className="text-[#007AFF]" />,
          }}
        />
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
        <GoogleAuthCallback />
        <CookiesPolicy />
        
        {/* Google One Tap / Identity Authentication Engine */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}