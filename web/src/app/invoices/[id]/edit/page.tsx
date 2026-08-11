import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/format-decimal";
import { InvoiceForm } from "../../invoice-form";

// Mirrors quotes/[id]/edit/page.tsx. docs/API Specification.md section 48 —
// only DRAFT invoices are editable.
export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!invoice) notFound();
  if (invoice.status !== "DRAFT") redirect(`/invoices/${invoice.id}`);

  return (
    <div className="flex flex-1 flex-col p-8">
      <h1 className="text-xl font-semibold text-zinc-900">Edit Invoice {invoice.invoiceNumber}</h1>
      <div className="mt-6">
        <InvoiceForm
          mode="edit"
          invoiceId={invoice.id}
          initialValues={{
            customerId: invoice.customerId,
            invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
            dueDate: invoice.dueDate ? invoice.dueDate.toISOString().slice(0, 10) : "",
            notes: invoice.notes ?? "",
            terms: invoice.terms ?? "",
            items: invoice.items.map((item) => ({
              productId: item.productId ?? "",
              name: item.name,
              description: item.description ?? "",
              unit: item.unit,
              quantity: formatDecimal(item.quantity, 3),
              unitPrice: formatDecimal(item.unitPrice),
              discountAmount: formatDecimal(item.discountAmount),
              taxRate: formatDecimal(item.taxRate),
            })),
          }}
        />
      </div>
    </div>
  );
}
