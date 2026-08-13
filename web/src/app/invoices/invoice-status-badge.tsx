import { Badge, badgeVariants } from "@/components/ui/badge";
import { type VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const LABELS: Record<string, string> = {
  DRAFT: "Draft",
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

const VARIANTS: Record<string, BadgeVariant> = {
  DRAFT: "secondary",
  UNPAID: "destructive",
  PARTIALLY_PAID: "secondary",
  PAID: "default",
};

// docs/UI-UX Specification.md sections 26-27, 33-34 equivalent for invoices — status
// pill shown across the invoice list, cards, and detail header. Mirrors
// quotes/quote-status-badge.tsx.
export function InvoiceStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "secondary"} className={className}>
      {LABELS[status] ?? status}
    </Badge>
  );
}