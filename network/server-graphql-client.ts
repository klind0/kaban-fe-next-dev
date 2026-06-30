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

const BACKEND_URL = process.env.API_URL || "https://kaban-ai-be-graphql.onrender.com";

async function execGqlFetch<T>(
  token: string | undefined,
  query: string,
  variables: unknown,
  headers: Record<string, string> = {},
): Promise<GraphQLResponse<T>> {
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  // Clean edge-case trailing slashes from the base URL configuration
  const cleanBaseUrl = BACKEND_URL.replace(/\/+$/, "");
  // Clean edge-case leading slashes from the endpoint constant configuration
  const cleanEndpoint = ENDPOINTS.GRAPHQL.replace(/^\/+/, "");

  // ✨ FIX: Intercept the string interpolation to enforce the global '/api' prefix path
  const targetUrl = `${cleanBaseUrl}/${cleanEndpoint}`;

  const res = await fetch(targetUrl, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...authHeader, ...headers },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    // Read the body as raw text first (safeguards against non-JSON crashes like 502/504 errors)
    const responseText = await res.text();
    
    console.error("==========================================");
    console.error(`❌ GRAPHQL SERVER ERROR DETAILS (Status ${res.status}):`);
    
    try {
      // Attempt to parse and print the formatted NestJS/GraphQL validation error array
      const parsedJson = JSON.parse(responseText);
      console.error(JSON.stringify(parsedJson, null, 2));
    } catch {
      // Fallback if the backend returned a flat string or HTML page error
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

  if (!refreshToken) redirect("/");

  const cleanBaseUrl = BACKEND_URL.replace(/\/+$/, "");
  const res = await fetch(
    `${cleanBaseUrl}/${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
    {
      method: "GET",
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