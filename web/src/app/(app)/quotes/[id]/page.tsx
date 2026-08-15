import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/format-decimal";
import { QuoteStatusBadge } from "../quote-status-badge";
import { QuoteStatusActions } from "./quote-status-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// docs/UI-UX Specification.md section 33.
export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      customer: { select: { id: true, name: true, companyName: true, email: true } },
      invoice: { select: { id: true } },
    },
  });
  if (!quote) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{quote.quoteNumber}</h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{quote.customer.name}</p>
        </div>
        <QuoteStatusActions quoteId={quote.id} status={quote.status} invoiceId={quote.invoice?.id ?? null} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Quote Date</p>
            <p className="mt-1 text-sm text-foreground">{quote.quoteDate.toISOString().slice(0, 10)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Valid Until</p>
            <p className="mt-1 text-sm text-foreground">
              {quote.expiryDate ? quote.expiryDate.toISOString().slice(0, 10) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Total</p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">{formatDecimal(quote.totalAmount)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quote Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted text-left text-xs font-medium uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit Price</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Tax</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{item.name}</p>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDecimal(item.quantity, 3)} {item.unit}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{formatDecimal(item.unitPrice)}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{formatDecimal(item.discountAmount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDecimal(item.taxRate)}%</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{formatDecimal(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex w-full max-w-xs flex-col gap-2 text-sm sm:w-72">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-mono text-foreground">{formatDecimal(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="font-mono text-foreground">{formatDecimal(quote.discountAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="font-mono text-foreground">{formatDecimal(quote.taxAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <dt className="text-foreground">Total</dt>
              <dd className="font-mono text-foreground">{formatDecimal(quote.totalAmount)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {(quote.notes || quote.terms) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quote.notes && (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm text-foreground">{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Terms</p>
                <p className="mt-1 text-sm text-foreground">{quote.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}