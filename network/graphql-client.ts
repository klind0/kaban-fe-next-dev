import { axiosInstance } from "./axios-instance";
import { ENDPOINTS } from "./endpoints";
import Cookies from "js-cookie";
import { useUserStore } from "@/app/stores/user-store";

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

const AUTH_COOKIE_NAME = "EzxqowpoqiaQa";

export async function gqlRequest<T, V = Record<string, unknown>>(
  query: string,
  variables?: V,
): Promise<T> {
  try {
    const response = await axiosInstance.post<GraphQLResponse<T>>(
      ENDPOINTS.GRAPHQL,
      {
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors?.length) {
      const err = response.data.errors[0];
      const code = err.extensions?.code;
      const statusCode = err.extensions?.originalError?.statusCode;

      if (
        code === "UNAUTHENTICATED" ||
        statusCode === 401 ||
        err.message?.toLowerCase().includes("unauthorized") ||
        err.message?.toLowerCase().includes("jwt expired")
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
  if (typeof window !== "undefined") {
    Cookies.remove(AUTH_COOKIE_NAME, { path: "/" });

    useUserStore.getState().logout?.();

    window.location.href = "/?error=session_expired";
  }
}