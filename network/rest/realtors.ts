import { getAccessToken } from "@/lib/admin-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://your-backend.onrender.com"; // ← set your real backend URL

async function restFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
  }
  return (json?.data ?? json) as T;
}

export type AdminRealtor = {
  id: string;
  realtor_pic?: string | null;
  bio?: string | null;
  company?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  verification_status?: string;
  is_founding_realtor?: boolean;
  rating?: number;
  user?: {
    id?: string;
    full_name?: string;
    email?: string;
  };
};

export async function fetchRealtors(): Promise<AdminRealtor[]> {
  const data = await restFetch<any>("/realtors");
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function setFoundingRealtor(id: string, isFounding: boolean) {
  return restFetch(`/realtors/admin/${id}/founding`, {
    method: "PUT",
    body: JSON.stringify({ is_founding_realtor: isFounding }),
  });
}