"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  price: string;
  taxRate: string;
};

type ListResponse = {
  success: boolean;
  data: ProductRow[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export function ProductList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [meta, setMeta] = useState<ListResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);

    const timeout = setTimeout(() => {
      fetch(`/api/v1/products?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((result: ListResponse) => {
          if (!result.success) {
            setError("Unable to load products.");
            return;
          }
          setRows(result.data);
          setMeta(result.meta);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError("Unable to load products.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, page]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          type="search"
          placeholder="Search by name or description"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full max-w-sm"
        />
        <Link href="/products/new">
          <Button variant="default">+ New Product</Button>
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Responsive container: table on desktop, cards on mobile */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        {/* Desktop: Table view */}
        <Table className="min-w-full divide-y divide-border text-sm">
          <TableHeader>
            <TableRow className="bg-muted text-left text-xs font-medium uppercase text-muted-foreground">
              <TableHead className="px-4 py-3">Name</TableHead>
              <TableHead className="px-4 py-3">Unit</TableHead>
              <TableHead className="px-4 py-3">Price</TableHead>
              <TableHead className="px-4 py-3">Tax %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  {search ? "No products match your search." : "No products yet. Add your first one."}
                </TableCell>
              </TableRow>
            )}
            {rows.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted">
                <TableCell className="px-4 py-3">
                  <Link href={`/products/${product.id}`} className="font-medium text-foreground hover:underline">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{product.unit}</TableCell>
                <TableCell className="px-4 py-3 font-mono text-foreground">{product.price}</TableCell>
                <TableCell className="px-4 py-3 font-mono text-muted-foreground">{product.taxRate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Desktop-only pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} products)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="block md:hidden">
        {/* Mobile: Card view */}
        <div className="space-y-4">
          {!loading && rows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {search ? "No products match your search." : "No products yet. Add your first one."}
            </p>
          ) : (
            <>
              {rows.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="block rounded-lg border border-border hover:bg-muted transition-colors hover:shadow-md"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{product.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{product.unit}</p>
                      </div>
                      <div className="text-right text-sm space-y-1">
                        <div className="font-mono text-foreground">{product.price}</div>
                        <div className="font-mono text-muted-foreground">{product.taxRate}% tax</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
