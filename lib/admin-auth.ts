import Cookies from "js-cookie";
import { QUERY_KEY } from "@/enum/queryKeys";

/** Match your app's Role enum (backend uses numbers). Adjust if needed. */
export const Role = {
  GUEST: 0,
  AGENT: 1,
  AGENCY: 2,
  ADMIN: 3,
} as const;

const USER_KEY = "kaban_admin_user";

export function getAccessToken(): string | undefined {
  return Cookies.get(QUERY_KEY.ACCESS_TOKEN) || Cookies.get("EzxqowpoqiaQa");
}

export function setAdminSession(accessToken: string, user: { id: string; email: string; fullName?: string; role: number | string }) {
  Cookies.set(QUERY_KEY.ACCESS_TOKEN, accessToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: 1,
  });
  // optional: store admin user in localStorage/sessionStorage if you already do
  if (typeof window !== "undefined") {
    localStorage.setItem("kaban_admin_user", JSON.stringify(user));
  }
}

export function clearAdminSession() {
  Cookies.remove(QUERY_KEY.ACCESS_TOKEN, { path: "/" });
  Cookies.remove(QUERY_KEY.REFRESH_TOKEN, { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem("kaban_admin_user");
  }
}

export function getStoredUser<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminRole(role: unknown): boolean {
  return role === Role.ADMIN || role === "ADMIN" || role === 3;
}