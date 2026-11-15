"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { gqlRequest } from "@/network/graphql-client";
import { ADMIN_LOGIN_MUTATION } from "@/network/gql/admin.ql";
import { isAdminRole, setAdminSession, clearAdminSession } from "@/lib/admin-auth";
import { QUERY_KEY } from "@/enum/queryKeys";

const cookieOpts = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await gqlRequest<{ login?: any; adminLogin?: any }>(
        ADMIN_LOGIN_MUTATION,
        {
          email: email.trim().toLowerCase(),
          password,
        },
      );

      const payload = data?.adminLogin ?? data?.login ?? data;
      const accessToken = payload?.accessToken || payload?.data?.accessToken;
      const refreshToken =
        payload?.refreshToken || payload?.data?.refreshToken;
      const user = payload?.user || payload?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Invalid response format received from server.");
      }

      if (!isAdminRole(user.role)) {
        clearAdminSession();
        throw new Error(
          "Access denied. Account lacks administrator privileges.",
        );
      }

      // Canonical cookies (same names as realtor login)
      Cookies.set(QUERY_KEY.ACCESS_TOKEN, accessToken, {
        ...cookieOpts,
        expires: 1,
      });
      if (refreshToken) {
        Cookies.set(QUERY_KEY.REFRESH_TOKEN, refreshToken, {
          ...cookieOpts,
          expires: 30,
        });
      }

      setAdminSession(accessToken, {
        id: user.id || user._id,
        email: user.email,
        fullName: user.fullName || user.full_name,
        role: user.role,
      });

      toast.success("Welcome, admin");
      router.replace("/admin/listings/pending");
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.error ||
        (typeof err === "string"
          ? err
          : "Sign-in failed. Please check your credentials.");

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kaban Admin</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to review listings
          </p>
        </div>

        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary)] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}