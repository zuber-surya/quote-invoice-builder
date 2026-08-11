"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Mirrors quotes/[id]/quote-status-actions.tsx. Invoices are created UNPAID
// (not DRAFT) by both direct creation and quote conversion (API Spec 46-47),
// so Edit/Delete are effectively unreachable today but kept for the DRAFT
// status the schema reserves (InvoiceStatus enum). Payment recording — the
// action that actually applies to UNPAID/PARTIALLY_PAID invoices — is Sprint 10.
export function InvoiceStatusActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this invoice?\n\nThis action cannot be undone.")) return;

    setBusy(true);
    setError(null);

    const response = await fetch(`/api/v1/invoices/${invoiceId}`, { method: "DELETE" });
    const result = await response.json().catch(() => null);
    setBusy(false);

    if (!response.ok || !result?.success) {
      setError(result?.error?.message ?? "Unable to delete invoice. Please try again.");
      return;
    }
    router.push("/invoices");
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
            <Link href={`/invoices/${invoiceId}/edit`} className={buttonClass}>
              Edit
            </Link>
            <button type="button" disabled={busy} onClick={handleDelete} className={buttonClass}>
              Delete
            </button>
          </>
        )}
        <a
          href={`/api/v1/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noreferrer"
          className={status === "DRAFT" ? buttonClass : primaryClass}
        >
          Download PDF
        </a>
      </div>

      {(status === "UNPAID" || status === "PARTIALLY_PAID") && (
        <p className="text-sm text-zinc-500">Payment recording is coming in a later update.</p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
