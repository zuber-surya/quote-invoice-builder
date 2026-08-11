import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { InvoiceForm } from "../invoice-form";

// Mirrors quotes/new/page.tsx.
export default async function NewInvoicePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col p-8">
      <h1 className="text-xl font-semibold text-zinc-900">Create Invoice</h1>
      <div className="mt-6">
        <InvoiceForm mode="create" />
      </div>
    </div>
  );
}
