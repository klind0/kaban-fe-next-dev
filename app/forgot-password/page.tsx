"use client";

import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FormControl from "@/components/universal/form-control";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { gqlRequest } from "@/network/graphql-client";
import { FORGOT_PASSWORD_MUTATION } from "@/network/gql/auth.ql";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: (email: string) =>
      gqlRequest(FORGOT_PASSWORD_MUTATION, { email }),
    onSuccess: () => {
      toast.success("If that email exists, we sent a reset link.");
    },
    onError: (err: Error) => {
      // Prefer generic message to avoid email enumeration
      toast.success("We've sent a reset link to this email.");
      console.error(err);
    },
  });

  const onSubmit = (data: FormValues) => mutateAsync(data.email.trim().toLowerCase());

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-l font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-neutral-900">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {isSuccess ? (
        <div className="space-y-4 rounded-lg border p-4 text-sm">
          <p>Check your inbox for a reset link. It may take a minute.</p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            Back to home
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            }}
            render={({ field }) => (
              <FormControl
                as="input"
                type="email"
                labelText="Email address"
                placeholder="you@example.com"
                {...field}
                error={getErrorMessage(errors.email)}
              />
            )}
          />
          <Button type="submit" className="w-full" loading={isPending}>
            Send reset link
          </Button>
          <p className="text-center text-sm">
            <Link href="/" className="text-primary font-semibold hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}