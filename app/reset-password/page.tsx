"use client";

import { Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { gqlRequest } from "@/network/graphql-client";
import { RESET_PASSWORD_MUTATION } from "@/network/gql/auth.ql";

type FormValues = {
  password: string;
  confirmPassword: string;
};

/** Normalize token if email/link accidentally put a full URL into ?token= */
function extractResetToken(raw: string): string {
  if (!raw) return "";
  const value = raw.trim();

  if (!value.includes("://") && !value.includes("token=")) {
    return value;
  }

  try {
    const url = value.startsWith("http")
      ? new URL(value)
      : new URL(value, "https://www.kaban.ng");
    const fromQuery = url.searchParams.get("token");
    if (fromQuery) return extractResetToken(fromQuery);
  } catch {
    // ignore
  }

  const match = value.match(/[?&]token=([^&]+)/i);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  return value;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = extractResetToken(searchParams.get("token") || "");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (newPassword: string) =>
      gqlRequest(RESET_PASSWORD_MUTATION, { token, newPassword }),
    onSuccess: () => {
      toast.success("Password updated successfully. Please sign in.");
      router.push("/");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Invalid or expired reset link.");
    },
  });

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6 text-center">
        <h1 className="text-lg font-semibold text-neutral-900">Invalid Link</h1>
        <p className="text-sm text-neutral-900">
          This reset link is missing a valid token. Please request a new link.
        </p>
        <Link
          href="/forgot-password"
          className="text-primary font-semibold hover:underline"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  const onSubmit = (data: FormValues) => mutateAsync(data.password);

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900">Reset Password</h1>
        <p className="mt-2 text-sm text-neutral-900">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: { value: 8, message: "At least 8 characters" },
          }}
          render={({ field }) => (
            <FormControl
              as="input"
              type="password"
              labelText="New password"
              placeholder="••••••••"
              {...field}
              error={getErrorMessage(errors.password)}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (v) => v === password || "Passwords do not match",
          }}
          render={({ field }) => (
            <FormControl
              as="input"
              type="password"
              labelText="Confirm password"
              placeholder="••••••••"
              {...field}
              error={getErrorMessage(errors.confirmPassword)}
            />
          )}
        />
        <Button type="submit" className="w-full" loading={isPending}>
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-sm">Loading reset form...</div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}