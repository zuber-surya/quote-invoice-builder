import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/format-decimal";
import { QuoteForm } from "../../quote-form";

// docs/API Specification.md section 35 — only DRAFT quotes are editable.
export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id, userId: user.id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quote) notFound();
  if (quote.status !== "DRAFT") redirect(`/quotes/${quote.id}`);

  return (
    <div className="flex flex-1 flex-col p-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Quote {quote.quoteNumber}</h1>
      <div className="mt-6">
        <QuoteForm
          mode="edit"
          quoteId={quote.id}
          initialValues={{
            customerId: quote.customerId,
            quoteDate: quote.quoteDate.toISOString().slice(0, 10),
            expiryDate: quote.expiryDate ? quote.expiryDate.toISOString().slice(0, 10) : "",
            notes: quote.notes ?? "",
            terms: quote.terms ?? "",
            items: quote.items.map((item) => ({
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
