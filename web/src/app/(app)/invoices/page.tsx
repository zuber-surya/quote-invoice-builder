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
        <h1 className="font-heading text-2xl font-semibold text-foreground">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage invoices billed to your customers.</p>
      </div>
      <InvoiceList />
    </div>
  );
}
