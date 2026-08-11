const STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  UNPAID: "bg-amber-100 text-amber-700",
  PARTIALLY_PAID: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
};

const LABELS: Record<string, string> = {
  DRAFT: "Draft",
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

// docs/UI-UX Specification.md sections 26-27, 33-34 equivalent for invoices — status
// pill shown across the invoice list, cards, and detail header. Mirrors
// quotes/quote-status-badge.tsx.
export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? STYLES.DRAFT}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
