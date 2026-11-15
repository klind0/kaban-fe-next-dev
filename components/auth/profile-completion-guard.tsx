"use client";

import { useUserStore } from "@/app/stores/user-store";
import { isProfileComplete } from "@/lib/profile-completion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function ProfileCompletionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4">
          <p className="text-center text-sm font-medium text-foreground">
            Loading…
          </p>
        </main>
      }
    >
      <ProfileCompletionGuardContent>{children}</ProfileCompletionGuardContent>
    </Suspense>
  );
}

function ProfileCompletionGuardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, realtor, isAuthenticated, hasHydrated } = useUserStore();
  const profileComplete = isProfileComplete(user, realtor);
  const sessionExpired = searchParams.get("error") === "session_expired";
  const mustCompleteProfile =
    hasHydrated &&
    isAuthenticated &&
    !profileComplete &&
    pathname !== "/dashboard/profile" &&
    !sessionExpired;

  useEffect(() => {
    if (mustCompleteProfile) {
      router.replace("/dashboard/profile?complete=1");
    }
  }, [mustCompleteProfile, router]);

  if (mustCompleteProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-center text-sm font-medium text-foreground">
          Complete your profile to continue.
        </p>
      </main>
    );
  }

  return children;
}
