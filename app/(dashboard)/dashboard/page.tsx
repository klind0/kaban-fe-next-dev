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
    
    // 🛠️ FIX 1: Add optional chaining (?.) to prevent crashing if data is undefined
    listings = data?.myListings?.data ?? [];
    meta = data?.myListings?.meta ?? meta;
    
  } catch (err) {
    if (isRedirectError(err)) throw err;
    
    console.error('❌ DASHBOARD FETCH ERROR LOG:', err);
    
    // 🛠️ FIX 2: Temporarily comment out the redirect so you can see the real error message 
    // on your screen instead of getting trapped in a logout loop.
    redirect('/?error=session_expired');
  }

  return (
    <DashboardHome listings={listings} meta={meta} />
  );
}