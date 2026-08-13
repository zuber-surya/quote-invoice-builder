import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  DRAFT: "Draft",
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

const VARIANTS: Record<string, string> = {
  DRAFT: "secondary",
  UNPAID: "destructive",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
};

// docs/UI-UX Specification.md sections 26-27, 33-34 equivalent for invoices — status
// pill shown across the invoice list, cards, and detail header. Mirrors
// quotes/quote-status-badge.tsx.
export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "secondary"}>
      {LABELS[status] ?? status}
    </Badge>
  );
}