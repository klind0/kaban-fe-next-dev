"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AdminRealtor, fetchRealtors, setFoundingRealtor } from "@/network/rest/realtors";
import RealtorAvatar from "@/components/shared/realtor-avatar";

export default function AdminRealtorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [realtor, setRealtor] = useState<AdminRealtor | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Reuse list endpoint and find (or add a GET /realtors/:id later)
        const list = await fetchRealtors();
        const found = list.find((r) => r.id === id);
        if (!found) throw new Error("Realtor not found");
        setRealtor(found);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load realtor");
        router.replace("/admin/realtors");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  async function toggle() {
    if (!realtor) return;
    setToggling(true);
    try {
      const next = !realtor.is_founding_realtor;
      await setFoundingRealtor(realtor.id, next);
      setRealtor({ ...realtor, is_founding_realtor: next });
      toast.success(next ? "Badge granted" : "Badge removed");
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading…</div>;
  }

  if (!realtor) return null;

  const name = realtor.user?.full_name || realtor.user?.email || "Realtor";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/realtors"
        className="text-sm font-medium text-[#437EF7] hover:underline"
      >
        ← Back to realtors
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <RealtorAvatar
            src={realtor.realtor_pic}
            alt={name}
            size={80}
            isFoundingRealtor={Boolean(realtor.is_founding_realtor)}
            fallbackClassName="bg-slate-200 text-slate-500 text-xl font-medium"
          />

          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">{name}</h1>
            <p className="text-sm text-slate-500">{realtor.company || "Independent"}</p>
            <p className="mt-1 text-sm-sm text-slate-600">{realtor.user?.email}</p>
          </div>

          <button
            type="button"
            disabled={toggling}
            onClick={toggle}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              realtor.is_founding_realtor
                ? "bg-[#437EF7] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {toggling
              ? "…"
              : realtor.is_founding_realtor
                ? "Founding Realtor ✓"
                : "Make Founding"}
          </button>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Mobile</dt>
            <dd className="font-medium">{realtor.mobile_number || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">WhatsApp</dt>
            <dd className="font-medium">{realtor.whatsapp_number || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Verification</dt>
            <dd className="font-medium">{realtor.verification_status || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Rating</dt>
            <dd className="font-medium">{realtor.rating ?? "—"}</dd>
          </div>
          {realtor.bio && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Bio</dt>
              <dd className="mt-1 text-slate-800">{realtor.bio}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}