import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { CustomerForm } from "../../customer-form";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const customer = await prisma.customer.findFirst({ where: { id, userId: user.id } });
  if (!customer) notFound();

  return (
    <div className="flex flex-1 justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Customer</h1>
        <CustomerForm
          mode="edit"
          customerId={customer.id}
          initialValues={{
            name: customer.name,
            companyName: customer.companyName ?? "",
            email: customer.email ?? "",
            phone: customer.phone ?? "",
            address: customer.address ?? "",
            city: customer.city ?? "",
            state: customer.state ?? "",
            country: customer.country ?? "",
            postalCode: customer.postalCode ?? "",
            taxNumber: customer.taxNumber ?? "",
            notes: customer.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
