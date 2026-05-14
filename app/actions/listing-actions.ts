"use server";

import {
  CREATE_LISTING_MUTATION,
  SUBMIT_LISTING_MUTATION,
} from "@/network/gql/listings.ql";
import { serverGqlRequest } from "@/network/server-graphql-client";
import { QUERY_KEY } from "@/enum/queryKeys";
import { cookies } from "next/headers";

export async function createListingAction(
  input: Record<string, unknown>,
): Promise<{ id: string }> {
  const data = await serverGqlRequest<{ createListing: { id: string } }>(
    CREATE_LISTING_MUTATION,
    { input, submit: false },
  );
  return data.createListing;
}

export async function submitListingAction(id: string): Promise<unknown> {
  const data = await serverGqlRequest<{ submitListing: unknown }>(
    SUBMIT_LISTING_MUTATION,
    { id },
  );
  return data.submitListing;
}

export async function uploadListingImagesAction(
  listingId: string,
  files: File[],
): Promise<void> {
  if (!files.length) return;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(QUERY_KEY.ACCESS_TOKEN)?.value;

  const fd = new FormData();
  files.forEach((f) => fd.append("images", f));

  const res = await fetch(
    `${process.env.API_URL}/api/listings/${listingId}/images`,
    {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: fd,
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Image upload failed: ${res.status}`);
  }
}
