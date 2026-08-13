import { Badge, badgeVariants } from "@/components/ui/badge";
import { type VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const VARIANTS: Record<string, BadgeVariant> = {
  DRAFT: "secondary",
  SENT: "default",
  ACCEPTED: "default",
  REJECTED: "destructive",
  EXPIRED: "secondary",
};

// docs/UI-UX Specification.md sections 26-27, 33-34 — status pill shown across
// the quote list, cards, and detail header. Mirrors
// invoices/invoice-status-badge.tsx.
export function QuoteStatusBadge({ status, className }: { status: string; className?: string }) {
  const label = LABELS[status] ?? status ?? "Unknown";
  const variant = VARIANTS[status] ?? "secondary";

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}