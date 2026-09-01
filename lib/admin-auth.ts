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

export function setAdminSession(accessToken: string, user: unknown) {
  Cookies.set(QUERY_KEY.ACCESS_TOKEN, accessToken, {
    expires: 30,
    secure: true,
    path: "/",
    sameSite: "lax",
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAdminSession() {
  Cookies.remove(QUERY_KEY.ACCESS_TOKEN, { path: "/" });
  Cookies.remove("EzxqowpoqiaQa", { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
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