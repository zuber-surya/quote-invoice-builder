import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { ProductList } from "./product-list";

// docs/Product Requirements Document.md section 11 — Product / Service Management.
export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Products & Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">Reusable items you can add to quotes and invoices.</p>
      </div>
      <ProductList />
    </div>
  );
}
