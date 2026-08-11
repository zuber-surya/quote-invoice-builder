import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { InvoiceList } from "./invoice-list";

// Mirrors quotes/page.tsx.
export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Invoices</h1>
        <p className="mt-1 text-sm text-zinc-500">Track and manage invoices billed to your customers.</p>
      </div>
      <InvoiceList />
    </div>
  );
}
