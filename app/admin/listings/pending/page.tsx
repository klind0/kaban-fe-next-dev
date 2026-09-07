"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { gqlRequest } from "@/network/graphql-client";
import { PENDING_LISTINGS_QUERY } from "@/network/gql/admin.ql";

type PendingItem = {
  id?: string;
  _id?: string;
  title?: string;
  property_id?: string;
  property_type?: string;
  status?: string;
  createdAt?: string;
  images?: { url?: string }[] | string[];
  location?: { city?: string; state?: string };
  realtor?: {
    full_name?: string;
    email?: string;
    user?: { full_name?: string; email?: string };
  };
  price?: { amount?: number; per?: string };
};

function listingId(item: PendingItem) {
  return item.id || item._id || "";
}

function imageUrl(item: PendingItem) {
  const img = item.images?.[0];
  if (!img) return null;
  return typeof img === "string" ? img : img.url;
}

function realtorName(item: PendingItem) {
  return (
    item.realtor?.full_name ||
    item.realtor?.user?.full_name ||
    item.realtor?.email ||
    item.realtor?.user?.email ||
    "—"
  );
}

function normalizeList(raw: unknown): PendingItem[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as PendingItem[];
    if (Array.isArray(obj.pendingListings)) return obj.pendingListings as PendingItem[];
  }
  return [];
}

export default function PendingListingsPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ pendingListings: unknown }>(
        PENDING_LISTINGS_QUERY,
      );
      setItems(normalizeList(data?.pendingListings ?? data));
    } catch (err: any) {
      toast.error(err?.message || "Failed to load pending listings");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pending review</h1>
          <p className="text-sm text-slate-500">
            Listings waiting for publish or reject
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          No pending listings right now.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Listing</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Realtor</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Location</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Price</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const id = listingId(item);
                const thumb = imageUrl(item);
                return (
                  <tr key={id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">
                            {item.title || "Untitled"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.property_id}
                            {item.property_type ? ` · ${item.property_type}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">{realtorName(item)}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {[item.location?.city, item.location?.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {item.price?.amount != null
                        ? `₦${Number(item.price.amount).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/listings/${id}`}
                        className="inline-flex rounded-md bg-[#437EF7] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3366d6]"
                      >
                        Review
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