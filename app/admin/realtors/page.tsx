"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import RealtorAvatar from "@/components/shared/realtor-avatar";

type RealtorUser = {
  full_name?: string;
  email?: string;
  role?: string;
};

type RealtorItem = {
  id?: string;
  _id?: string;
  bio?: string;
  company?: string;
  mobile_number?: string;
  whatsapp_number?: string;
  is_founding_realtor?: boolean;
  realtor_pic?: string;
  user?: RealtorUser;
};

function getRealtorId(item: RealtorItem): string {
  return item.id || item._id || "";
}

function getRealtorName(item: RealtorItem): string {
  return item.user?.full_name || item.company || "Unnamed Realtor";
}

function getRealtorEmail(item: RealtorItem): string {
  return item.user?.email || "—";
}

export default function AdminRealtorsPage() {
  const [realtors, setRealtors] = RealtorItemState();
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Helper state definition for clean code
  function RealtorItemState() {
    return useState<RealtorItem[]>([]);
  }

  const fetchRealtors = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/realtors` 
        : "http://localhost:5000/realtors"; // Adjust to your backend URL base

      const response = await fetch(res, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch realtors");
      }

      const result = await response.json();
      // Handle NestJS SuccessInterceptor wrapper or direct array response
      const dataList = Array.isArray(result) ? result : result.data || [];
      setRealtors(dataList);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load realtors");
      setRealtors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealtors();
  }, [fetchRealtors]);

  // Compute live counter for Founding Realtors
  const foundingCount = realtors.filter((r) => r.is_founding_realtor).length;

  const handleToggleFounding = async (realtorId: string, currentStatus: boolean) => {
    setUpdatingId(realtorId);
    try {
      const token = localStorage.getItem("token") || "";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await fetch(`${baseUrl}/realtors/admin/${realtorId}/founding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_founding_realtor: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update founding status");
      }

      // Optimistically update local state
      setRealtors((prev) =>
        prev.map((r) =>
          getRealtorId(r) === realtorId
            ? { ...r, is_founding_realtor: !currentStatus }
            : r
        )
      );

      toast.success(
        !currentStatus
          ? "Founding Realtor badge granted successfully!"
          : "Founding Realtor badge revoked."
      );
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header & Live Counter Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            Realtor Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage registered realtors and assign Founding Realtor badges for the MVP launch.
          </p>
        </div>
        
        {/* Founding Realtor Counter Badge */}
        <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Founding Cap
            </p>
            <p className="text-lg font-bold text-neutral-900">
              <span className={foundingCount >= 20 ? "text-red-600" : "text-emerald-700"}>
                {foundingCount}
              </span>{" "}
              / 20 Claimed
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      {loading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-500 shadow-sm">
          Loading realtors...
        </div>
      ) : realtors.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-neutral-200 p-12 text-center text-neutral-500 shadow-sm">
          No realtors registered yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Realtor</th>
                <th className="px-6 py-4 hidden md:table-cell">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {realtors.map((item) => {
                const id = getRealtorId(item);
                const name = getRealtorName(item);
                const email = getRealtorEmail(item);
                const isFounding = Boolean(item.is_founding_realtor);
                const isUpdating = updatingId === id;

                return (
                  <tr key={id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Realtor Profile / Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <RealtorAvatar
                          src={item.realtor_pic}
                          alt={name}
                          size={40}
                          isFoundingRealtor={isFounding}
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">{name}</p>
                          <p className="text-xs text-neutral-500 font-mono">{id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4 hidden md:table-cell text-neutral-600">
                      <p className="font-medium text-neutral-900">{email}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {item.mobile_number || item.whatsapp_number || "No phone added"}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {isFounding ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Founding Realtor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                          Standard Agent
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={isUpdating || (!isFounding && foundingCount >= 20)}
                        onClick={() => handleToggleFounding(id, isFounding)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
                          isFounding
                            ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                            : foundingCount >= 20
                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isUpdating
                          ? "Processing..."
                          : isFounding
                          ? "Revoke Badge"
                          : foundingCount >= 20
                          ? "Cap Reached (20/20)"
                          : "Grant Founding Badge"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}