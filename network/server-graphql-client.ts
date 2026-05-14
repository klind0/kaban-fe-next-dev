/**
 * Server-side GraphQL client that calls the backend directly.
 * Use this in Server Components / generateMetadata instead of gqlRequest,
 * which relies on the client-side axios proxy ("/api").
 */

import { ENDPOINTS } from "./endpoints";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QUERY_KEY } from "@/enum/queryKeys";

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const BACKEND_URL = process.env.API_URL || "";

async function execGqlFetch<T>(
  token: string | undefined,
  query: string,
  variables: unknown,
  headers: Record<string, string> = {},
): Promise<GraphQLResponse<T>> {
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${BACKEND_URL}/${ENDPOINTS.GRAPHQL}`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...authHeader, ...headers },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  return res.json();
}

async function refreshAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(QUERY_KEY.REFRESH_TOKEN)?.value;

  if (!refreshToken) redirect("/");

  const res = await fetch(
    `${BACKEND_URL}/api/${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${refreshToken}` },
    },
  );

  if (!res.ok) redirect("/");

  const body = await res.json();
  const newAccessToken: string | undefined = body?.data?.tokens?.accessToken;
  const newRefreshToken: string | undefined = body?.data?.tokens?.refreshToken;

  if (!newAccessToken) redirect("/");

  cookieStore.set(QUERY_KEY.ACCESS_TOKEN, newAccessToken, {
    secure: true,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  if (newRefreshToken) {
    cookieStore.set(QUERY_KEY.REFRESH_TOKEN, newRefreshToken, {
      secure: true,
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
  }

  return newAccessToken;
}

export async function serverGqlRequest<T, V = Record<string, unknown>>(
  query: string,
  variables?: V,
  headers?: Record<string, string>,
): Promise<T> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(QUERY_KEY.ACCESS_TOKEN)?.value;

  let json = await execGqlFetch<T>(accessToken, query, variables, headers);

  if (json.errors?.length) {
    const msg = json.errors[0].message;
    if (msg === "Token has expired" || msg === "Unauthorized") {
      accessToken = await refreshAccessToken();
      json = await execGqlFetch<T>(accessToken, query, variables, headers);
    }
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}
