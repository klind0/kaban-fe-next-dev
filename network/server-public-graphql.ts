
import { ENDPOINTS } from "./endpoints";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  process.env.BACKEND_URL?.replace(/\/$/, "") ||
  "";

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
  const url = `${BASE}${ENDPOINTS.GRAPHQL.startsWith("/") ? "" : "/"}${ENDPOINTS.GRAPHQL}`;
  // Prefer: `${BASE}/api/graphql` if ENDPOINTS.GRAPHQL is just "graphql"

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