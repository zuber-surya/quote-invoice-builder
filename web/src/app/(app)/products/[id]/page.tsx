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
          <h1 className="font-heading text-2xl font-semibold text-foreground">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.unit}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/products/${product.id}/edit`}>Edit</Link>
          </Button>
          <DeleteProductButton productId={product.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Price</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">{formatDecimal(product.price)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">Tax %</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">{formatDecimal(product.taxRate)}%</dd>
          </div>
          {product.description && (
            <div className="mt-4">
              <dt className="text-xs font-medium uppercase text-muted-foreground">Description</dt>
              <dd className="mt-0.5 text-sm text-foreground">{product.description}</dd>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}