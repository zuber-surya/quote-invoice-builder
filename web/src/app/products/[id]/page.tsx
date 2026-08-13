import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { formatDecimal } from "@/lib/format-decimal";
import { DeleteProductButton } from "./delete-product-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { id, userId: user.id } });
  if (!product) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{product.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">{product.unit}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/${product.id}/edit`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Edit
          </Link>
          <DeleteProductButton productId={product.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500">Price</dt>
            <dd className="mt-0.5 text-sm text-zinc-900">{formatDecimal(product.price)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500">Tax %</dt>
            <dd className="mt-0.5 text-sm text-zinc-900">{formatDecimal(product.taxRate)}%</dd>
          </div>
          {product.description && (
            <div className="mt-4">
              <dt className="text-xs font-medium uppercase text-zinc-500">Description</dt>
              <dd className="mt-0.5 text-sm text-zinc-900">{product.description}</dd>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}