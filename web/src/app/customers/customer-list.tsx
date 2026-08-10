"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
        <input
          type="search"
          placeholder="Search by name, company, email, or phone"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
        />
        <Link
          href="/customers/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + New Customer
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Quotes</th>
              <th className="px-4 py-3">Invoices</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                  {search ? "No customers match your search." : "No customers yet. Add your first one."}
                </td>
              </tr>
            )}
            {rows.map((customer) => (
              <tr key={customer.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link href={`/customers/${customer.id}`} className="font-medium text-zinc-900 hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{customer.companyName ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{customer.email ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{customer.phone ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{customer.quoteCount}</td>
                <td className="px-4 py-3 text-zinc-600">{customer.invoiceCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} customers)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
