"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// docs/API Specification.md sections 50-52.
export function RecordPaymentForm({ invoiceId, onClose }: { invoiceId: string; onClose: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const response = await fetch(`/api/v1/invoices/${invoiceId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, paymentDate, notes }),
    });
    const result = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok || !result?.success) {
      setError(result?.error?.message ?? "Unable to record payment. Please try again.");
      return;
    }

    onClose();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="payment-amount" className="text-xs font-medium text-zinc-700">
          Amount *
        </label>
        <input
          id="payment-amount"
          required
          inputMode="decimal"
          placeholder="10000.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="payment-date" className="text-xs font-medium text-zinc-700">
          Payment Date
        </label>
        <input
          id="payment-date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="payment-notes" className="text-xs font-medium text-zinc-700">
          Notes
        </label>
        <input
          id="payment-notes"
          placeholder="Cash, bank transfer, …"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? "Recording…" : "Record Payment"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="w-full text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
