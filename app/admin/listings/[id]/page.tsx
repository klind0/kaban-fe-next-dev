"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { gqlRequest } from "@/network/graphql-client";
import {
  LISTING_FOR_REVIEW_QUERY,
  PENDING_LISTINGS_QUERY,
  PUBLISH_LISTING_MUTATION,
  REJECT_LISTING_MUTATION,
} from "@/network/gql/admin.ql";
import RejectDialog from "@/components/admin/reject-dialog";

function unwrapListing(raw: unknown): any {
  if (!raw) return null;
  if (typeof raw === "object" && raw !== null && "publicListing" in (raw as object)) {
    return (raw as any).publicListing;
  }
  return raw;
}

export default function AdminListingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<"publish" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      try {
        const data = await gqlRequest(LISTING_FOR_REVIEW_QUERY, { id });
        const item = unwrapListing(data);
        if (item && (item.id || item._id || item.title)) {
          setListing(item);
          return;
        }
      } catch {
        /* fall through */
      }

      const pending = await gqlRequest<{ pendingListings: unknown }>(
        PENDING_LISTINGS_QUERY,
      );
      const list = Array.isArray(pending?.pendingListings)
        ? pending.pendingListings
        : Array.isArray((pending as any)?.data)
          ? (pending as any).data
          : [];
      const found = list.find((l: any) => String(l.id || l._id) === id);
      if (!found) throw new Error("Listing not found in pending queue");
      setListing(found);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load listing");
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const publish = async () => {
    setActing("publish");
    try {
      await gqlRequest(PUBLISH_LISTING_MUTATION, { id });
      toast.success("Listing published");
      router.push("/admin/listings/pending");
    } catch (err: any) {
      toast.error(err?.message || "Publish failed");
    } finally {
      setActing(null);
    }
  };

  const reject = async (payload: { reasons: string[]; note?: string }) => {
    setActing("reject");
    try {
      await gqlRequest(REJECT_LISTING_MUTATION, {
        id,
        input: {
          reasons: payload.reasons,
          note: payload.note ?? null,
        },
      });
      toast.success("Listing rejected");
      setRejectOpen(false);
      router.push("/admin/listings/pending");
    } catch (err: any) {
      toast.error(err?.message || "Reject failed");
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading listing…</p>;
  }

  if (!listing) {
    return (
      <div className="space-y-3">
        <p className="text-slate-600">Listing not found.</p>
        <Link href="/admin/listings/pending" className="font-medium text-[#437EF7]">
          ← Back to pending
        </Link>
      </div>
    );
  }

  const images: string[] = (listing.images || [])
    .map((img: any) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);

  const realtorName =
    listing.realtor?.full_name || listing.realtor?.user?.full_name || "—";
  const realtorEmail =
    listing.realtor?.email || listing.realtor?.user?.email || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/listings/pending"
            className="text-sm font-medium text-[#437EF7] hover:underline"
          >
            ← Pending queue
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{listing.title || "Untitled"}</h1>
          <p className="text-sm text-slate-500">
            {listing.property_id}
            {listing.listing_state ? ` · ${listing.listing_state}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!!acting}
            onClick={() => setRejectOpen(true)}
            className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={!!acting}
            onClick={publish}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {acting === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            No images
          </div>
        ) : (
          images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-video w-full rounded-lg bg-slate-100 object-cover"
            />
          ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Property</h2>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-slate-500">Category</dt>
            <dd>{listing.property_category || "—"}</dd>
            <dt className="text-slate-500">Type</dt>
            <dd>{listing.property_type || "—"}</dd>
            <dt className="text-slate-500">Status</dt>
            <dd>{listing.status || "—"}</dd>
            <dt className="text-slate-500">Price</dt>
            <dd>
              {listing.price?.amount != null
                ? `₦${Number(listing.price.amount).toLocaleString()}${
                    listing.price.per ? ` / ${listing.price.per}` : ""
                  }`
                : "—"}
            </dd>
            <dt className="text-slate-500">Location</dt>
            <dd>
              {[listing.location?.address, listing.location?.city, listing.location?.state]
                .filter(Boolean)
                .join(", ") || "—"}
            </dd>
          </dl>
          {listing.description && (
            <div className="border-t border-slate-100 pt-3 text-sm whitespace-pre-wrap text-slate-700">
              {listing.description}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Realtor</h2>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-slate-500">Name</dt>
            <dd>{realtorName}</dd>
            <dt className="text-slate-500">Email</dt>
            <dd className="break-all">{realtorEmail}</dd>
            <dt className="text-slate-500">Mobile</dt>
            <dd>{listing.realtor?.mobile_number || "—"}</dd>
            <dt className="text-slate-500">WhatsApp</dt>
            <dd>{listing.realtor?.whatsapp_number || "—"}</dd>
          </dl>
          {listing.details && (
            <>
              <h3 className="pt-2 font-semibold">Details</h3>
              <pre className="overflow-x-auto rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                {JSON.stringify(listing.details, null, 2)}
              </pre>
            </>
          )}
        </section>
      </div>

      <RejectDialog
        open={rejectOpen}
        listingTitle={listing.title}
        isPending={acting === "reject"}
        onClose={() => setRejectOpen(false)}
        onConfirm={reject}
      />
    </div>
  );
}