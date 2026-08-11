import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/format-decimal";
import { InvoiceStatusBadge } from "../invoice-status-badge";
import { InvoiceStatusActions } from "./invoice-status-actions";

// Mirrors quotes/[id]/page.tsx.
export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      customer: { select: { id: true, name: true, companyName: true, email: true } },
      quote: { select: { id: true, quoteNumber: true } },
    },
  });
  if (!invoice) notFound();

  const remainingAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-900">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">{invoice.customer.name}</p>
          {invoice.quote && (
            <p className="mt-1 text-xs text-zinc-500">
              Converted from quote{" "}
              <Link href={`/quotes/${invoice.quote.id}`} className="underline">
                {invoice.quote.quoteNumber}
              </Link>
            </p>
          )}
        </div>
        <InvoiceStatusActions invoiceId={invoice.id} status={invoice.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Invoice Date</p>
          <p className="mt-1 text-sm text-zinc-900">{invoice.invoiceDate.toISOString().slice(0, 10)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Due Date</p>
          <p className="mt-1 text-sm text-zinc-900">
            {invoice.dueDate ? invoice.dueDate.toISOString().slice(0, 10) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Total</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">{formatDecimal(invoice.totalAmount)}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Remaining</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">{remainingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Tax</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{item.name}</p>
                  {item.description && <p className="text-xs text-zinc-500">{item.description}</p>}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatDecimal(item.quantity, 3)} {item.unit}
                </td>
                <td className="px-4 py-3 text-zinc-600">{formatDecimal(item.unitPrice)}</td>
                <td className="px-4 py-3 text-zinc-600">{formatDecimal(item.discountAmount)}</td>
                <td className="px-4 py-3 text-zinc-600">{formatDecimal(item.taxRate)}%</td>
                <td className="px-4 py-3 text-zinc-600">{formatDecimal(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <dl className="flex w-full max-w-xs flex-col gap-2 text-sm sm:w-72">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Subtotal</dt>
            <dd className="text-zinc-900">{formatDecimal(invoice.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Discount</dt>
            <dd className="text-zinc-900">{formatDecimal(invoice.discountAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Tax</dt>
            <dd className="text-zinc-900">{formatDecimal(invoice.taxAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold">
            <dt className="text-zinc-900">Total</dt>
            <dd className="text-zinc-900">{formatDecimal(invoice.totalAmount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Paid</dt>
            <dd className="text-zinc-900">{formatDecimal(invoice.paidAmount)}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt className="text-zinc-900">Remaining</dt>
            <dd className="text-zinc-900">{remainingAmount.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {invoice.notes && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">Notes</p>
              <p className="mt-1 text-sm text-zinc-900">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium uppercase text-zinc-500">Terms</p>
              <p className="mt-1 text-sm text-zinc-900">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
