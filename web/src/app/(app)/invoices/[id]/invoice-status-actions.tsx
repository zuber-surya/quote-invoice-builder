"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecordPaymentForm } from "./record-payment-form";

// Mirrors quotes/[id]/quote-status-actions.tsx. Invoices are created UNPAID
// (not DRAFT) by both direct creation and quote conversion (API Spec 46-47),
// so Edit/Delete are effectively unreachable today but kept for the DRAFT
// status the schema reserves (InvoiceStatus enum).
export function InvoiceStatusActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {status === "DRAFT" && (
          <>
            <Link href={`/invoices/${invoiceId}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </>
        )}
        {(status === "UNPAID" || status === "PARTIALLY_PAID") && !showPaymentForm && (
          <Button
            onClick={() => setShowPaymentForm(true)}
            disabled={busy}
          >
            {busy ? "Recording…" : "Record Payment"}
          </Button>
        )}
        <a
          href={`/api/v1/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noreferrer"
        >
          <Button
            variant={status === "DRAFT" ? "outline" : "default"}
          >
            Download PDF
          </Button>
        </a>
      </div>

      {showPaymentForm && (
        <div className="w-full">
          <RecordPaymentForm invoiceId={invoiceId} onClose={() => setShowPaymentForm(false)} />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}