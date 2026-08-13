"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type CustomerRow = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  quoteCount: number;
  invoiceCount: number;
};

type ListResponse = {
  success: boolean;
  data: CustomerRow[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export function CustomerList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CustomerRow[]>([]);
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
      fetch(`/api/v1/customers?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((result: ListResponse) => {
          if (!result.success) {
            setError("Unable to load customers.");
            return;
          }
          setRows(result.data);
          setMeta(result.meta);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError("Unable to load customers.");
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
        <div className="flex w-full max-w-sm gap-2">
          <Input
            type="search"
            placeholder="Search by name, company, email, or phone"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <Link href="/customers/new">
            <Button variant="default">+ New Customer</Button>
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Responsive container: table on desktop, cards on mobile */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-200">
        {/* Desktop: Table view */}
        <Table className="min-w-full divide-y divide-zinc-200 text-sm">
          <TableHeader>
            <TableRow className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <TableHead className="px-4 py-3">Name</TableHead>
              <TableHead className="px-4 py-3">Company</TableHead>
              <TableHead className="px-4 py-3">Email</TableHead>
              <TableHead className="px-4 py-3">Phone</TableHead>
              <TableHead className="px-4 py-3">Quotes</TableHead>
              <TableHead className="px-4 py-3">Invoices</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  {search ? "No customers match your search." : "No customers yet. Add your first one."}
                </TableCell>
              </TableRow>
            )}
            {rows.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-zinc-50">
                <TableCell className="px-4 py-3">
                  <Link href={`/customers/${customer.id}`} className="font-medium text-zinc-900 hover:underline">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-zinc-600>{customer.companyName ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-zinc-600>{customer.email ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-zinc-600>{customer.phone ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-zinc-600>{customer.quoteCount}</TableCell>
                <TableCell className="px-4 py-3 text-zinc-600>{customer.invoiceCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Desktop-only pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} customers)
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
            <p className="text-center text-zinc-500 py-8">
              {search ? "No customers match your search." : "No customers yet. Add your first one."}
            </p>
          ) : (
            <>
              {rows.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="block rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors hover:shadow-md"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-900">{customer.name}</h3>
                        {customer.companyName && (
                          <p className="mt-1 text-sm text-zinc-600">{customer.companyName}</p>
                        )}
                      </div>
                      <div className="text-right text-sm space-y-1">
                        <div className="text-zinc-600">Quotes: <span className="font-medium">{customer.quoteCount}</span></div>
                        <div className="text-zinc-600">Invoices: <span className="font-medium">{customer.invoiceCount}</span></div>
                      </div>
                    </div>
                    {customer.email || customer.phone ? (
                      <div className="mt-2 text-sm text-zinc-600 space-y-1">
                        {customer.email && (
                          <>
                            <span className="mr-2">���������������������������������������������📧</span>
                            {customer.email}
                          </>
                        )}
                        {customer.phone && (
                          <>
                            <span className="mr-2">���������������������������������������������📱</span>
                            {customer.phone}
                          </>
                        )}
                      </div>
                    ) : null}
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