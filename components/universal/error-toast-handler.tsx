"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/app/stores/user-store";
import React from "react";

const ERROR_MESSAGES: Record<string, string> = {
  session_expired: "Your session has expired. Please sign in again.",
};

export default function ErrorToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const clearUser = useUserStore((s) => s.clearUser);

  React.useEffect(() => {
    if (!error) return;

    clearUser();
    const message = ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.";
    toast.error(message);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const newUrl = params.size > 0 ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [error]);

  return null;
}
