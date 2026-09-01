"use client";

import { useState } from "react";
import { REJECT_REASONS } from "@/network/gql/admin.ql";

type Props = {
  open: boolean;
  listingTitle?: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (payload: { reasons: string[]; note?: string }) => void;
};

export default function RejectDialog({
  open,
  listingTitle,
  isPending,
  onClose,
  onConfirm,
}: Props) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");

  if (!open) return null;

  const toggle = (value: string) => {
    setReasons((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value],
    );
  };

  const submit = () => {
    if (reasons.length === 0) return;
    onConfirm({ reasons, note: note.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-lg font-semibold">Reject listing</h2>
        {listingTitle && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{listingTitle}</p>
        )}

        <p className="mt-4 text-sm font-medium text-slate-700">Reasons (required)</p>
        <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
          {REJECT_REASONS.map((r) => (
            <label key={r.value} className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={reasons.includes(r.value)}
                onChange={() => toggle(r.value)}
                disabled={isPending}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Note (optional)
          <textarea
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#437EF7]"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            placeholder="Visible guidance for the realtor…"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            onClick={submit}
            disabled={isPending || reasons.length === 0}
          >
            {isPending ? "Rejecting…" : "Confirm reject"}
          </button>
        </div>
      </div>
    </div>
  );
}