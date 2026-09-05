import { axiosInstance } from "./axios-instance";
import { ENDPOINTS } from "./endpoints";
import Cookies from "js-cookie";
import { useUserStore } from "@/app/stores/user-store";
import { QUERY_KEY } from "@/enum/queryKeys";

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

  // Check if this request is a login/auth mutation (e.g. LOGIN_MUTATION or admin login)
  const isAuthMutation =
    /login|signup|adminlogin|signin/i.test(query);

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

      const isUnauthenticated =
        code === "UNAUTHENTICATED" ||
        statusCode === 401 ||
        msg.includes("unauthorized") ||
        msg.includes("jwt expired") ||
        msg.includes("authentication token required") ||
        msg.includes("token has expired");

      // ONLY treat as an expired session if it's NOT an explicit login/signup attempt
      if (isUnauthenticated && !isAuthMutation) {
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
    if (error?.response?.status === 401 && !isAuthMutation) {
      handleSessionExpiration();
    }
    throw error;
  }
}

function handleSessionExpiration() {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;

  // Clear token cookies
  Cookies.remove(AUTH_COOKIE_NAME, { path: "/" });
  Cookies.remove("EzxqowpoqiaQa", { path: "/" });
  if (QUERY_KEY.ACCESS_TOKEN) {
    Cookies.remove(QUERY_KEY.ACCESS_TOKEN, { path: "/" });
  }

  useUserStore.getState().logout?.();

  // Route-aware redirect: Send admin users to admin login, others stay put or go home
  if (currentPath.startsWith("/admin")) {
    if (currentPath !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  } else {
    // For non-admin paths, stay on current page or redirect to public home
    if (currentPath.startsWith("/dashboard")) {
      window.location.href = "/";
    }
  }
}