import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">New Product</h1>
        <p className="mt-1 text-sm text-zinc-500">Name, unit, and price are required.</p>
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
