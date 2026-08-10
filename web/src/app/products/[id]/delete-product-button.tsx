"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;

    setDeleting(true);
    setError(null);

    const response = await fetch(`/api/v1/products/${productId}`, { method: "DELETE" });
    const result = await response.json().catch(() => null);
    setDeleting(false);

    if (!response.ok || !result?.success) {
      setError(result?.error?.message ?? "Unable to delete product. Please try again.");
      return;
    }

    router.push("/products");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
