"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// docs/UI-UX Specification.md section 34 — only valid actions are shown for the
// current status.
export function QuoteStatusActions({
  quoteId,
  status,
  invoiceId,
}: {
  quoteId: string;
  status: string;
  invoiceId: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert() {
    setBusy(true);
    setError(null);

    const response = await fetch(`/api/v1/quotes/${quoteId}/convert-to-invoice`, { method: "POST" });
    const result = await response.json().catch(() => null);
    setBusy(false);

    if (!response.ok || !result?.success) {
      setError(result?.error?.message ?? "Unable to convert quote to invoice. Please try again.");
      return;
    }
    router.push(`/invoices/${result.data.id}`);
    router.refresh();
  }

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

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {status === "DRAFT" && (
          <>
            <Link href={`/quotes/${quoteId}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? "Deleting…" : "Delete"}
            </Button>
            <Button
              onClick={() => changeStatus("SENT")}
              disabled={busy}
            >
              {busy ? "Updating…" : "Send / Mark as Sent"}
            </Button>
          </>
        )}

        {status === "SENT" && (
          <>
            <a href={`/api/v1/quotes/${quoteId}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="outline">Download PDF</Button>
            </a>
            <Button
              variant="outline"
              onClick={() => changeStatus("REJECTED")}
              disabled={busy}
            >
              {busy ? "Updating…" : "Mark Rejected"}
            </Button>
            <Button
              onClick={() => changeStatus("ACCEPTED")}
              disabled={busy}
            >
              {busy ? "Updating…" : "Mark Accepted"}
            </Button>
          </>
        )}

        {(status === "REJECTED" || status === "EXPIRED") && (
          <a href={`/api/v1/quotes/${quoteId}/pdf`} target="_blank" rel="noreferrer">
            <Button>Download PDF</Button>
          </a>
        )}

        {status === "ACCEPTED" && (
          <>
            <a href={`/api/v1/quotes/${quoteId}/pdf`} target="_blank" rel="noreferrer">
              <Button variant="outline">Download PDF</Button>
            </a>
            {invoiceId ? (
              <Link href={`/invoices/${invoiceId}`}>
                <Button>View Invoice</Button>
              </Link>
            ) : (
              <Button
                onClick={handleConvert}
                disabled={busy}
              >
                {busy ? "Converting…" : "Convert to Invoice"}
              </Button>
            )}
          </>
        )}
      </div>

      {status === "SENT" && (
        <Button
          variant="outline"
          size="xs"
          onClick={() => changeStatus("EXPIRED")}
          disabled={busy}
        >
          Mark as expired
        </Button>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}