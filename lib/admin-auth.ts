import Cookies from "js-cookie";

/** Match your app's Role enum (backend uses numbers). Adjust if needed. */
export const Role = {
  GUEST: 0,
  AGENT: 1,
  AGENCY: 2,
  ADMIN: 3,
} as const;

const TOKEN_KEY = "QUERY_KEY.ACCESS_TOKEN"; // align with QUERY_KEY.ACCESS_TOKEN if different
const USER_KEY = "kaban_admin_user";

export function getAccessToken(): string | undefined {
  return Cookies.get(TOKEN_KEY) || Cookies.get("EzxqowpoqiaQa");
}

export function setAdminSession(accessToken: string, user: unknown) {
  Cookies.set(TOKEN_KEY, accessToken, {
    expires: 7,
    secure: true,
    path: "/",
    sameSite: "lax",
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAdminSession() {
  Cookies.remove(TOKEN_KEY, { path: "/" });
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