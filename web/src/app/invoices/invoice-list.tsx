"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { InvoiceStatusBadge } from "./invoice-status-badge";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: string;
  totalAmount: string;
  remainingAmount: string;
  customer: { id: string; name: string } | null;
};

type CustomerOption = { id: string; name: string };

type ListResponse = {
  success: boolean;
  data: InvoiceRow[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

const STATUS_OPTIONS = ["DRAFT", "UNPAID", "PARTIALLY_PAID", "PAID"];
const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

// Mirrors quotes/quote-list.tsx — same filter/search/pagination shape against
// GET /api/v1/invoices (docs/API Specification.md section 43).
export function InvoiceList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [meta, setMeta] = useState<ListResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  useEffect(() => {
    fetch("/api/v1/customers?pageSize=100")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setCustomers(result.data.map((c: CustomerOption) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (customerId) params.set("customerId", customerId);

    const timeout = setTimeout(() => {
      fetch(`/api/v1/invoices?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((result: ListResponse) => {
          if (!result.success) {
            setError("Unable to load invoices. Please check your connection and try again.");
            return;
          }
          setRows(result.data);
          setMeta(result.meta);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError("Unable to load invoices. Please check your connection and try again.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, status, customerId, page]);

  const hasFilters = search || status || customerId;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search by invoice number or customer"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-64 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={customerId}
            onChange={(e) => {
              setPage(1);
              setCustomerId(e.target.value);
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          >
            <option value="">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Create Invoice
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  {hasFilters ? (
                    <span className="text-zinc-500">No invoices match your filters.</span>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium text-zinc-900">No invoices yet</p>
                      <p className="text-zinc-500">Create your first invoice, or convert an accepted quote.</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
            {rows.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-zinc-900 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{invoice.customer?.name ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{invoice.invoiceDate}</td>
                <td className="px-4 py-3 text-zinc-600">{invoice.totalAmount}</td>
                <td className="px-4 py-3 text-zinc-600">{invoice.remainingAmount}</td>
                <td className="px-4 py-3">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} invoices)
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
