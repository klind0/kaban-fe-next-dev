import { axiosInstance } from "./axios-instance";
import { ENDPOINTS } from "./endpoints";
import Cookies from "js-cookie";
import { useUserStore } from "@/app/stores/user-store";
import { QUERY_KEY } from "@/enum/queryKeys";

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
  const token = Cookies.get(QUERY_KEY.ACCESS_TOKEN);

  const isAuthMutation = /login|signup|adminlogin|signin|forgotpassword|resetpassword/i.test(
    query,
  );

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

  Cookies.remove(QUERY_KEY.ACCESS_TOKEN, { path: "/" });
  Cookies.remove(QUERY_KEY.REFRESH_TOKEN, { path: "/" });

  useUserStore.getState().logout?.();

  if (currentPath.startsWith("/admin")) {
    if (currentPath !== "/admin/login") {
      window.location.href = "/admin/login";
    }
  } else if (currentPath.startsWith("/dashboard")) {
    window.location.href = "/?error=session_expired";
  }
}