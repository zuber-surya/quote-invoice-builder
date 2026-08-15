import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { DeleteCustomerButton } from "./delete-customer-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, userId: user.id },
    include: { _count: { select: { quotes: true, invoices: true } } },
  });
  if (!customer) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">{customer.name}</h1>
          {customer.companyName && <p className="mt-1 text-sm text-muted-foreground">{customer.companyName}</p>}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/customers/${customer.id}/edit`}>Edit</Link>
          </Button>
          <DeleteCustomerButton customerId={customer.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label="Address" value={customer.address} />
          <DetailRow label="City" value={customer.city} />
          <DetailRow label="State" value={customer.state} />
          <DetailRow label="Country" value={customer.country} />
          <DetailRow label="Postal Code" value={customer.postalCode} />
          <DetailRow label="Tax / GST Number" value={customer.taxNumber} />
        </CardContent>
      </Card>

      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <DetailRow label="Notes" value={customer.notes} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quotes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="mt-1 text-2xl font-semibold text-foreground">{customer._count.quotes}</p>
            {customer._count.quotes === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">Quote management isn&apos;t available yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="mt-1 text-2xl font-semibold text-foreground">{customer._count.invoices}</p>
            {customer._count.invoices === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">Invoice management isn&apos;t available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}