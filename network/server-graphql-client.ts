/**
 * Server-side GraphQL client that calls the backend directly.
 * Use this in Server Components / generateMetadata instead of gqlRequest,
 * which relies on the client-side axios proxy ("/api").
 *
 * Expected:
 *   API_URL = https://kaban-ai-be-graphql.onrender.com/api
 *   → GraphQL = https://kaban-ai-be-graphql.onrender.com/api/graphql
 */

import { ENDPOINTS } from "./endpoints";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QUERY_KEY } from "@/enum/queryKeys";

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const RAW_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://kaban-ai-be-graphql.onrender.com/api";

/** Strip trailing slashes only */
function normalizeBase(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/**
 * API root that always ends with /api
 * - if env is .../api  → keep it
 * - if env is host only → append /api
 */
function getApiRoot(): string {
  const base = normalizeBase(RAW_API_URL);
  if (/\/api$/i.test(base)) return base;
  return `${base}/api`;
}

/** Full GraphQL URL: .../api/graphql */
function getGraphqlUrl(): string {
  const endpoint = String(ENDPOINTS.GRAPHQL || "graphql").replace(/^\/+/, "");
  return `${getApiRoot()}/${endpoint}`;
}

/** Full REST path under /api (e.g. auth/refresh) */
function getApiUrl(path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${getApiRoot()}/${clean}`;
}

async function execGqlFetch<T>(
  token: string | undefined,
  query: string,
  variables: unknown,
  headers: Record<string, string> = {},
): Promise<GraphQLResponse<T>> {
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const targetUrl = getGraphqlUrl();

  const res = await fetch(targetUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const responseText = await res.text();

    console.error("==========================================");
    console.error(`❌ GRAPHQL SERVER ERROR DETAILS (Status ${res.status}):`);
    console.error(`URL: ${targetUrl}`);

    try {
      const parsedJson = JSON.parse(responseText);
      console.error(JSON.stringify(parsedJson, null, 2));
    } catch {
      console.error(responseText || "[Empty Response Body]");
    }
    console.error("==========================================");

    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  return res.json();
}

async function refreshAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(QUERY_KEY.REFRESH_TOKEN)?.value;

  if (!refreshToken) redirect("/?error=session_expired");

  const refreshPath = String(
    ENDPOINTS.AUTH?.REFRESH_TOKEN || "auth/refresh",
  ).replace(/^\/+/, "");

  const res = await fetch(getApiUrl(refreshPath), {
    method: "GET",
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  if (!res.ok) redirect("/?error=session_expired");

  const body = await res.json();
  // Support both wrapped and unwrapped token shapes
  const newAccessToken: string | undefined =
    body?.data?.tokens?.accessToken ??
    body?.data?.accessToken ??
    body?.accessToken;
  const newRefreshToken: string | undefined =
    body?.data?.tokens?.refreshToken ??
    body?.data?.refreshToken ??
    body?.refreshToken;

  if (!newAccessToken) redirect("/?error=session_expired");

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
    if (
      msg === "Token has expired" ||
      msg === "Unauthorized" ||
      /jwt expired|unauthenticated/i.test(msg)
    ) {
      accessToken = await refreshAccessToken();
      json = await execGqlFetch<T>(accessToken, query, variables, headers);
    }
  }

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}