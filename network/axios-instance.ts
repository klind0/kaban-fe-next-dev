import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { ENDPOINTS } from "./endpoints";
import { QUERY_KEY } from "@/enum/queryKeys";
import { ITokens, SuccessResponse } from "@/types/responseTypes";

export const axiosInstance = axios.create({
  baseURL:
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.API_URL || 
  "https://kaban-ai-be-graphql.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (req) => {
    const accessToken = Cookies.get(QUERY_KEY.ACCESS_TOKEN);
    if (accessToken != null) {
      req.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    req.headers.Accept = "application/json";
    if (req.data instanceof FormData) {
      // Let the browser/XHR set Content-Type with the correct multipart boundary
      delete req.headers["Content-Type"];
    } else {
      req.headers["Content-Type"] = "application/json";
    }

    return req;
  },
  (error) => {
    throw (
      error?.response?.data ?? {
        statusCode: 0,
        message: error?.message ?? "Something went wrong",
        error: "ERR_NETWORK",
      }
    );
  },
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (error?.response?.data?.message === "Forbidden resource") {
      Cookies.remove(QUERY_KEY.ACCESS_TOKEN);
      Cookies.remove(QUERY_KEY.REFRESH_TOKEN);
      toast.error("Access denied. Please log in again.");

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return Promise.reject(
        error?.response?.data ?? {
          statusCode: 403,
          message: "Access denied",
          error: "ERR_FORBIDDEN",
        },
      );
    }

    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get(QUERY_KEY.REFRESH_TOKEN);
        const response = await axios.post<
          SuccessResponse<{
            tokens: ITokens;
          }>
        >(`/api/${ENDPOINTS.AUTH.REFRESH_TOKEN}`, null, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        const newAccessToken = response.data?.data?.tokens?.accessToken;
        const newRefreshToken = response.data?.data?.tokens?.refreshToken;

        Cookies.set(QUERY_KEY.ACCESS_TOKEN, newAccessToken, {
          expires: 30,
          secure: true,
        });
        Cookies.set(QUERY_KEY.REFRESH_TOKEN, newRefreshToken, {
          expires: 365,
          secure: true,
        });

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        Cookies.remove(QUERY_KEY.ACCESS_TOKEN);
        Cookies.remove(QUERY_KEY.REFRESH_TOKEN);

        if (typeof window !== "undefined") {
          window.location.href = "/";
        }

        if (axios.isAxiosError(refreshError) && refreshError.response?.data) {
          return Promise.reject(refreshError.response.data);
        }

        return Promise.reject({
          statusCode: 0,
          message:
            refreshError instanceof Error
              ? refreshError.message
              : "Session expired. Please log in again.",
          error: "ERR_REFRESH",
        });
      }
    }

    throw (
      error?.response?.data ?? {
        statusCode: 0,
        message: error?.message ?? "Something went wrong",
        error: "ERR_NETWORK",
      }
    );
  },
);
