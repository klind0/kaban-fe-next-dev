import { axiosInstance } from "./axios-instance";
import { ENDPOINTS } from "./endpoints";
import Cookies from "js-cookie";
import { useUserStore } from "@/app/stores/user-store";
import { QUERY_KEY } from "@/enum/queryKeys";

// Prefer shared key; keep legacy name as fallback
const AUTH_COOKIE_NAME = QUERY_KEY.ACCESS_TOKEN || "EzxqowpoqiaQa";

interface GraphQLErrorExtensions {
  code?: string;
  originalError?: {
    statusCode?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: GraphQLErrorExtensions }[];
}

export async function gqlRequest<T, V = Record<string, unknown>>(
  query: string,
  variables?: V,
): Promise<T> {
  const token =
    Cookies.get(AUTH_COOKIE_NAME) ||
    Cookies.get("EzxqowpoqiaQa") ||
    Cookies.get(QUERY_KEY.ACCESS_TOKEN);

  try {
    const response = await axiosInstance.post<GraphQLResponse<T>>(
      ENDPOINTS.GRAPHQL,
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    if (response.data.errors?.length) {
      const err = response.data.errors[0];
      const code = err.extensions?.code;
      const statusCode = err.extensions?.originalError?.statusCode;
      const msg = (err.message || "").toLowerCase();

      if (
        code === "UNAUTHENTICATED" ||
        statusCode === 401 ||
        msg.includes("unauthorized") ||
        msg.includes("jwt expired") ||
        msg.includes("authentication token required") ||
        msg.includes("token has expired")
      ) {
        handleSessionExpiration();
      }

      throw {
        statusCode: statusCode ?? 400,
        message: err.message,
        error: code ?? "ERR_GRAPHQL",
      };
    }

    return response.data.data as T;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      handleSessionExpiration();
    }
    throw error;
  }
}

function handleSessionExpiration() {
  if (typeof window === "undefined") return;

  Cookies.remove(AUTH_COOKIE_NAME, { path: "/" });
  Cookies.remove("EzxqowpoqiaQa", { path: "/" });
  if (QUERY_KEY.ACCESS_TOKEN) {
    Cookies.remove(QUERY_KEY.ACCESS_TOKEN, { path: "/" });
  }

  useUserStore.getState().logout?.();

  // Avoid fighting /admin routes — only hard-redirect if not already on login
  if (!window.location.pathname.startsWith("/admin/login")) {
    window.location.href = "/admin/login";
  }
}