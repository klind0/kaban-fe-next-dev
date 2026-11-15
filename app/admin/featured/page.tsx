"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { gqlRequest } from "@/network/graphql-client";
import {
  FEATURED_LISTINGS_QUERY,
  PUBLIC_LISTINGS_FOR_ADMIN_QUERY,
  SET_FEATURED_MUTATION,
} from "@/network/gql/admin.ql";

type ListingRow = {
  id?: string;
  _id?: string;
  title?: string;
  property_id?: string;
  property_type?: string;
  isFeatured?: boolean;
  images?: { url?: string }[] | string[];
  location?: { city?: string; state?: string };
  price?: { amount?: number; per?: string };
};

function listingId(item: ListingRow): string {
  return String(item.id || item._id || "");
}

function imageUrl(item: ListingRow): string | null {
  const img = item.images?.[0];
  if (!img) return null;
  return typeof img === "string" ? img : img.url || null;
}

function unwrapList(raw: unknown): ListingRow[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as ListingRow[];
  }
  return [];
}

export default function AdminFeaturedPage() {
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pub, feat] = await Promise.all([
        gqlRequest<{ publicListings: unknown }>(PUBLIC_LISTINGS_FOR_ADMIN_QUERY, {
          filter: { page: 1, limit: 50 },
        }),
        gqlRequest<{ featuredListings: unknown }>(FEATURED_LISTINGS_QUERY, {
          limit: 50,
        }),
      ]);

      const published = unwrapList(pub?.publicListings);
      const featured = unwrapList(feat?.featuredListings);
      const featuredIds = new Set(featured.map(listingId).filter(Boolean));

      // Merge: prefer published list; mark currently featured
      const byId = new Map<string, ListingRow>();
      for (const item of published) {
        const id = listingId(item);
        if (!id) continue;
        byId.set(id, { ...item, isFeatured: featuredIds.has(id) });
      }
      // Include featured that might not be in first public page
      for (const item of featured) {
        const id = listingId(item);
        if (!id) continue;
        if (!byId.has(id)) {
          byId.set(id, { ...item, isFeatured: true });
        }
      }

      const list = Array.from(byId.values());
      setRows(list);

      // Pre-select currently featured
      setSelected(new Set(list.filter((r) => r.isFeatured).map(listingId)));
    } catch (err: any) {
      toast.error(err?.message || "Failed to load listings");
      setRows([]);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = [
        r.title,
        r.property_id,
        r.property_type,
        r.location?.city,
        r.location?.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((r) => {
        const id = listingId(r);
        if (id) next.add(id);
      });
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const save = async () => {
    const listingIds = Array.from(selected).filter(Boolean);
    if (listingIds.length === 0) {
      toast.error("Select at least one listing to feature");
      return;
    }

    setSaving(true);
    try {
      await gqlRequest(SET_FEATURED_MUTATION, { listingIds });
      toast.success(`Featured ${listingIds.length} listing(s)`);
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update featured listings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Featured listings</h1>
          <p className="text-sm text-slate-500">
            Select published listings to show as featured. No need to copy MongoDB ids.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading || saving}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={save}
            disabled={loading || saving || selected.size === 0}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary)] disabled:opacity-50"
          >
            {saving ? "Saving…" : `Save featured (${selected.size})`}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search title, property id, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
        />
        <button
          type="button"
          onClick={selectAllFiltered}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Select filtered
        </button>
        <button
          type="button"
          onClick={clearSelection}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          No published listings found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <tr>
                <th className="w-12 px-4 py-3">Featured</th>
                <th className="px-4 py-3 font-medium">Listing</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Property ID</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Location</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const id = listingId(item);
                const thumb = imageUrl(item);
                const checked = selected.has(id);
                return (
                  <tr
                    key={id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(id)}
                        disabled={!id || saving}
                        className="h-4 w-4"
                        aria-label={`Feature ${item.title || id}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 line-clamp-1">
                            {item.title || "Untitled"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.property_type || "—"}
                            {item.isFeatured ? " · currently featured" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs sm:table-cell">
                      {item.property_id || "—"}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {[item.location?.city, item.location?.state]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {item.price?.amount != null
                        ? `₦${Number(item.price.amount).toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Tip: checked rows are sent as <code>listingIds</code> on save. Search by
        title or property id (e.g. KID-…) — you never need to open MongoDB.
      </p>
    </div>
  );
}