import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { DeleteCustomerButton } from "./delete-customer-button";

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-900">{value || "—"}</dd>
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
          <h1 className="text-xl font-semibold text-zinc-900">{customer.name}</h1>
          {customer.companyName && <p className="mt-1 text-sm text-zinc-500">{customer.companyName}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Edit
          </Link>
          <DeleteCustomerButton customerId={customer.id} />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label="Address" value={customer.address} />
          <DetailRow label="City" value={customer.city} />
          <DetailRow label="State" value={customer.state} />
          <DetailRow label="Country" value={customer.country} />
          <DetailRow label="Postal Code" value={customer.postalCode} />
          <DetailRow label="Tax / GST Number" value={customer.taxNumber} />
        </dl>
        {customer.notes && (
          <div className="mt-4">
            <DetailRow label="Notes" value={customer.notes} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Quotes</h2>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{customer._count.quotes}</p>
          {customer._count.quotes === 0 && (
            <p className="mt-1 text-sm text-zinc-500">Quote management isn&apos;t available yet.</p>
          )}
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-700">Invoices</h2>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">{customer._count.invoices}</p>
          {customer._count.invoices === 0 && (
            <p className="mt-1 text-sm text-zinc-500">Invoice management isn&apos;t available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
