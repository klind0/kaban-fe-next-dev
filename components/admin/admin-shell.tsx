"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminSession, getStoredUser, isAdminRole } from "@/lib/admin-auth";
import { useEffect, useState } from "react";

const nav = [
  { href: "/admin/listings/pending", label: "Pending review" },
  { href: "/admin/featured", label: "Featured" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userLabel, setUserLabel] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }

    const user = getStoredUser<{ role?: number | string; email?: string; fullName?: string }>();
    if (!user || !isAdminRole(user.role)) {
      router.replace("/admin/login");
      return;
    }
    setUserLabel(user.fullName || user.email || "Admin");
    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading admin…
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/listings/pending" className="text-lg font-bold text-[#437EF7]">
              Kaban Admin
            </Link>
            <nav className="flex gap-1">
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      active
                        ? "bg-[#437EF7]/10 text-[#437EF7]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">{userLabel}</span>
            <button
              type="button"
              className="rounded-md border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50"
              onClick={() => {
                clearAdminSession();
                router.replace("/admin/login");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}