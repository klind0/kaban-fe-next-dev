import { MY_LISTINGS_QUERY } from "@/network/gql/listings.ql";
import { serverGqlRequest } from "@/network/server-graphql-client";
import DashboardHome from "@/screens/dashboard/dashboard-home";
import { IListing, IListingMeta } from "@/types/listingTypes";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

const DEFAULT_META: IListingMeta = { total: 0, page: 1, limit: 10, totalPages: 0, search: '' };

export default async function page({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const { page: pageParam, search } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  let listings: IListing[] = [];
  let meta: IListingMeta = { ...DEFAULT_META, page };

  try {
    const data = await serverGqlRequest<{ myListings?: { data: IListing[]; meta: IListingMeta } }>(
      MY_LISTINGS_QUERY,
      { page, limit: 10, search: search || undefined }
    );
    listings = data.myListings?.data ?? [];
    meta = data.myListings?.meta ?? meta;
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error('Failed to fetch listings:', err);
    redirect('/?error=session_expired');
  }

  return (
    <DashboardHome listings={listings} meta={meta} />
  );
}
