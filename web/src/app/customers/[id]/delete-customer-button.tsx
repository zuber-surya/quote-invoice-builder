"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteCustomerButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this customer? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/customers/${customerId}`, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      setDeleting(false);

      if (!response.ok || !result?.success) {
        setError(result?.error?.message ?? "Unable to delete customer. Please try again.");
        return;
      }

      router.push("/customers");
      router.refresh();
    } catch (error) {
      setDeleting(false);
      setError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "Deleting…" : "Delete"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}