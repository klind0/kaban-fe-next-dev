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
import GoogleMapsScript from "@/components/universal/google-maps-script";
import ProfileCompletionGuard from "@/components/auth/profile-completion-guard";

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
        <GoogleMapsScript />

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
              error: "!bg-[var(--color-red-50)] !border-[var(--color-red-300)] !text-[var(--foreground)]",
              success: "!bg-[var(--color-green-50)] !border-[var(--color-green-300)] !text-[var(--foreground)]",
              warning: "!bg-[var(--color-amber-50)] !border-[var(--color-amber-300)] !text-[var(--foreground)]",
              info: "!bg-[var(--color-blue-50)] !border-[var(--color-blue-300)] !text-[var(--foreground)]",
            },
          }}
          icons={{
            error: <InformationCircle className="text-[var(--destructive)]" />,
            success: <TickCheck className="text-[var(--color-green-700)] size-4" />,
            warning: <Danger className="text-[var(--color-amber-500)]" />,
            info: <InformationCircle className="text-[var(--primary)]" />,
          }}
        />
        <ReactQueryProvider>
          <ProfileCompletionGuard>{children}</ProfileCompletionGuard>
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