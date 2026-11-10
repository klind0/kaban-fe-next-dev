"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import RealtorAvatar from "@/components/shared/realtor-avatar";
import {
  AdminRealtor,
  fetchRealtors,
  setFoundingRealtor,
} from "@/network/rest/realtors";

export default function AdminRealtorsPage() {
  const [realtors, setRealtors] = useState<AdminRealtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRealtors();
      setRealtors(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load realtors");
      setRealtors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const foundingCount = realtors.filter((r) => r.is_founding_realtor).length;

  async function toggleFounding(realtor: AdminRealtor) {
    const next = !realtor.is_founding_realtor;
    if (next && foundingCount >= 20) {
      toast.error("Maximum of 20 Founding Realtors reached");
      return;
    }

    setTogglingId(realtor.id);
    try {
      await setFoundingRealtor(realtor.id, next);
      setRealtors((prev) =>
        prev.map((r) =>
          r.id === realtor.id ? { ...r, is_founding_realtor: next } : r,
        ),
      );
      toast.success(
        next
          ? "Founding Realtor badge granted"
          : "Founding Realtor badge removed",
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update badge");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Realtors</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage profiles and Founding Realtor badges
          </p>
        </div>
        <div className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#437EF7]">
          Founding: {foundingCount} / 20
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading realtors…</div>
      ) : realtors.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No realtors found</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Realtor</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Contact</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Status</th>
                <th className="px-4 py-3 font-medium">Founding</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {realtors.map((r) => {
                const name =
                  r.user?.full_name || r.user?.email || "Unnamed Realtor";
                const email = r.user?.email || "—";
                const isFounding = !!r.is_founding_realtor;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <RealtorAvatar
                          src={r.realtor_pic}
                          alt={name}
                          size={40}
                          isFoundingRealtor={isFounding}
                          fallbackClassName="bg-slate-200 text-slate-500 text-xs font-medium"
                        />
                        <div>
                          <div className="font-medium text-slate-900">{name}</div>
                          <div className="text-xs text-slate-500">
                            {r.company || "Independent"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="text-slate-700">{email}</div>
                      <div className="text-xs text-slate-500">
                        {r.mobile_number || r.whatsapp_number || "—"}
                      </div>
                    </td>

                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.verification_status === "VERIFIED"
                            ? "bg-green-50 text-green-700"
                            : r.verification_status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {r.verification_status || "NOT_VERIFIED"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={togglingId === r.id}
                        onClick={() => toggleFounding(r)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          isFounding
                            ? "bg-[#437EF7] text-white hover:bg-[#3269d9]"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        } disabled:opacity-50`}
                      >
                        {togglingId === r.id
                          ? "…"
                          : isFounding
                            ? "Founding ✓"
                            : "Make Founding"}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/realtors/${r.id}`}
                        className="text-sm font-medium text-[#437EF7] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}