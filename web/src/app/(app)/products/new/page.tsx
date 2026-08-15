import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-8">
        <h1 className="font-heading text-2xl font-semibold text-foreground">New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Name, unit, and price are required.</p>
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
