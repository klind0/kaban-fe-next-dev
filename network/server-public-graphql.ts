
import { ENDPOINTS } from "./endpoints";

const RAW_API_URL =
  process.env.API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.BACKEND_URL?.trim() ||
  process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
  "https://kaban-ai-be-graphql.onrender.com/api";

type GqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

/**
 * Public GraphQL only — no auth cookie.
 * Safe to cache / revalidate.
 */
export async function serverPublicGqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number | false; tags?: string[] },
): Promise<T> {
  const apiBase = RAW_API_URL.replace(/\/+$/, "");
  const apiRoot = /\/api$/i.test(apiBase) ? apiBase : `${apiBase}/api`;
  const endpoint = String(ENDPOINTS.GRAPHQL || "graphql").replace(/^\/+/, "");
  const url = new URL(endpoint, `${apiRoot}/`);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // Cache policy
    next: {
      revalidate: options?.revalidate ?? 60, // 60s ISR-style cache
      tags: options?.tags ?? ["public-listings"],
    },
  });

  if (!res.ok) {
    throw new Error(`Public GraphQL HTTP ${res.status}`);
  }

  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data as T;
}