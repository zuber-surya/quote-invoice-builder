"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="payment-amount">
          Amount *
        </Label>
        <Input
          id="payment-amount"
          required
          inputMode="decimal"
          placeholder="10000.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="payment-date">
          Payment Date
        </Label>
        <Input
          id="payment-date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <Label htmlFor="payment-notes">
          Notes
        </Label>
        <Input
          id="payment-notes"
          placeholder="Cash, bank transfer, …"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={saving}
        >
          {saving ? "Recording…" : "Record Payment"}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
      {error && (
        <p role="alert" className="w-full text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}