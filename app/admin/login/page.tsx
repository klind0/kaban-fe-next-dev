"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { gqlRequest } from "@/network/graphql-client";
import { ADMIN_LOGIN_MUTATION } from "@/network/gql/admin.ql";
import { isAdminRole, setAdminSession } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await gqlRequest<{ login: any }>(ADMIN_LOGIN_MUTATION, {
        email: email.trim().toLowerCase(),
        password,
      });

      const payload = data?.login ?? data;
      const accessToken = payload?.accessToken || payload?.data?.accessToken;
      const user = payload?.user || payload?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Unexpected login response shape");
      }

      if (!isAdminRole(user.role)) {
        throw new Error("This account is not an admin.");
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
      toast.error(err?.message || "Sign-in failed");
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
          <p className="mt-1 text-sm text-slate-500">Sign in to review listings</p>
        </div>

        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#437EF7]"
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
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#437EF7]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#437EF7] py-2.5 text-sm font-semibold text-white hover:bg-[#3366d6] disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}