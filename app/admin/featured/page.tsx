"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { gqlRequest } from "@/network/graphql-client";
import {
  FEATURED_LISTINGS_QUERY,
  SET_FEATURED_MUTATION,
} from "@/network/gql/admin.ql";

export default function AdminFeaturedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [idInput, setIdInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ featuredListings: any }>(
        FEATURED_LISTINGS_QUERY,
        { limit: 50 },
      );
      const raw = data?.featuredListings ?? data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];
      setItems(list);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load featured listings");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const featureById = async () => {
    const id = idInput.trim();
    if (!id) return;
    setSaving(true);
    try {
      await gqlRequest(SET_FEATURED_MUTATION, { listingIds: [id] });
      toast.success("Listing marked featured");
      setIdInput("");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to set featured");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Featured listings</h1>
        <p className="text-sm text-slate-500">
          Additive feature flags — featuring one listing does not clear others
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <input
          className="min-w-[240px] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#437EF7]"
          placeholder="Published listing ID to feature"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
        />
        <button
          type="button"
          disabled={saving || !idInput.trim()}
          onClick={featureById}
          className="rounded-md bg-[#437EF7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3366d6] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Set featured"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          No featured listings
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {items.map((item) => {
            const id = item.id || item._id;
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.title || id}</p>
                  <p className="text-xs text-slate-500">{item.property_id}</p>
                </div>
                <code className="text-xs text-slate-400">{id}</code>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}