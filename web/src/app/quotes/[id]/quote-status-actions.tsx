"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// docs/UI-UX Specification.md section 34 — only valid actions are shown for the
// current status. Download PDF / Convert to Invoice aren't implemented yet
// (Sprints 8-9), so they're omitted rather than shown as dead buttons.
export function QuoteStatusActions({ quoteId, status }: { quoteId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(nextStatus: string) {
    setBusy(true);
    setError(null);

    const response = await fetch(`/api/v1/quotes/${quoteId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const result = await response.json().catch(() => null);
    setBusy(false);

    if (!response.ok || !result?.success) {
      setError(result?.error?.message ?? "Unable to update quote status. Please try again.");
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this quote?\n\nThis action cannot be undone.")) return;

    setBusy(true);
    setError(null);

    const response = await fetch(`/api/v1/quotes/${quoteId}`, { method: "DELETE" });
    const result = await response.json().catch(() => null);
    setBusy(false);

    if (!response.ok || !result?.success) {
      setError(result?.error?.message ?? "Unable to delete quote. Please try again.");
      return;
    }
    router.push("/quotes");
    router.refresh();
  }

  const buttonClass =
    "rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60";
  const primaryClass =
    "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {status === "DRAFT" && (
          <>
            <Link href={`/quotes/${quoteId}/edit`} className={buttonClass}>
              Edit
            </Link>
            <button type="button" disabled={busy} onClick={handleDelete} className={buttonClass}>
              Delete
            </button>
            <button type="button" disabled={busy} onClick={() => changeStatus("SENT")} className={primaryClass}>
              Send / Mark as Sent
            </button>
          </>
        )}

        {status === "SENT" && (
          <>
            <button type="button" disabled={busy} onClick={() => changeStatus("REJECTED")} className={buttonClass}>
              Mark Rejected
            </button>
            <button type="button" disabled={busy} onClick={() => changeStatus("ACCEPTED")} className={primaryClass}>
              Mark Accepted
            </button>
          </>
        )}
      </div>

      {status === "SENT" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => changeStatus("EXPIRED")}
          className="text-xs font-medium text-zinc-500 hover:underline"
        >
          Mark as expired
        </button>
      )}

      {(status === "ACCEPTED" || status === "REJECTED" || status === "EXPIRED") && (
        <p className="text-sm text-zinc-500">PDF generation and invoice conversion are coming in a later update.</p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
