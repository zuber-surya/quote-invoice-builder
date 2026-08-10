import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/format-decimal";
import { ProductForm } from "../../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { id, userId: user.id } });
  if (!product) notFound();

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">Edit Product</h1>
        <ProductForm
          mode="edit"
          productId={product.id}
          initialValues={{
            name: product.name,
            description: product.description ?? "",
            unit: product.unit,
            price: formatDecimal(product.price),
            taxRate: formatDecimal(product.taxRate),
          }}
        />
      </div>
    </div>
  );
}
