import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { CustomerList } from "./customer-list";

// docs/Product Requirements Document.md section 10 — Customer Management.
export default async function CustomersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage the customers you send quotes and invoices to.</p>
      </div>
      <CustomerList />
    </div>
  );
}
