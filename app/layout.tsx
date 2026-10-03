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
import MetaPixelPageview from "@/components/meta-pixel-pageview";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  title: "Kaban.ng",
  description: "Smartest way to scout real estate",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
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

        {/* Meta Pixel */}
        {META_PIXEL_ID ? (
          <>
            <Script id="meta-pixel-base" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
            <MetaPixelPageview />
          </>
        ) : null}

        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              error: "!bg-[#FFEDED] !border-[#FFB8B7] !text-[#1A1A1A]",
              success: "!bg-[#E5FBEC] !border-[#66E78E] !text-[#1A1A1A]",
              warning: "!bg-[#FFF7E5] !border-[#FFD266] !text-[#1A1A1A]",
              info: "!bg-[#E9F5FF] !border-[#7AC5FF] !text-[#1A1A1A]",
            },
          }}
          icons={{
            error: <InformationCircle className="text-[#FF3B30]" />,
            success: <TickCheck className="text-[#04912D] size-4" />,
            warning: <Danger className="text-[#FFB400]" />,
            info: <InformationCircle className="text-[#007AFF]" />,
          }}
        />
        <ReactQueryProvider>{children}</ReactQueryProvider>
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