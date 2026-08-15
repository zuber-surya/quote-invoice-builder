"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { QuoteStatusBadge } from "./quote-status-badge";

type QuoteRow = {
  id: string;
  quoteNumber: string;
  quoteDate: string;
  status: string;
  totalAmount: string;
  customer: { id: string; name: string } | null;
};

type CustomerOption = { id: string; name: string };

type ListResponse = {
  success: boolean;
  data: QuoteRow[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

const STATUS_OPTIONS = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];
const ALL_STATUSES = "ALL";
const ALL_CUSTOMERS = "ALL";

export function QuoteList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<QuoteRow[]>([]);
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
      fetch(`/api/v1/quotes?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((result: ListResponse) => {
          if (!result.success) {
            setError("Unable to load quotes. Please check your connection and try again.");
            return;
          }
          setRows(result.data);
          setMeta(result.meta);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError("Unable to load quotes. Please check your connection and try again.");
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
          <Input
            type="search"
            placeholder="Search by quote number or customer"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <Select
            value={status || ALL_STATUSES}
            onValueChange={(value) => {
              setPage(1);
              setStatus(value === ALL_STATUSES ? "" : value ?? "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={customerId || ALL_CUSTOMERS}
            onValueChange={(value) => {
              setPage(1);
              setCustomerId(value === ALL_CUSTOMERS ? "" : value ?? "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CUSTOMERS}>All customers</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Link href="/quotes/new">
          <Button variant="default">+ Create Quote</Button>
        </Link>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Responsive container: table on desktop, cards on mobile */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        {/* Desktop: Table view */}
        <Table className="min-w-full divide-y divide-border text-sm">
          <TableHeader>
            <TableRow className="bg-muted text-left text-xs font-medium uppercase text-muted-foreground">
              <TableHead className="px-4 py-3">Quote</TableHead>
              <TableHead className="px-4 py-3">Customer</TableHead>
              <TableHead className="px-4 py-3">Date</TableHead>
              <TableHead className="px-4 py-3">Amount</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-10 text-center">
                  {hasFilters ? (
                    <span className="text-muted-foreground">No quotes match your filters.</span>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <p className="font-medium text-foreground">No quotes yet</p>
                      <p className="text-muted-foreground">Create your first quote.</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
            {rows.map((quote) => (
              <TableRow key={quote.id} className="hover:bg-muted">
                <TableCell className="px-4 py-3">
                  <Link href={`/quotes/${quote.id}`} className="font-medium text-foreground hover:underline">
                    {quote.quoteNumber}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{quote.customer?.name ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{quote.quoteDate}</TableCell>
                <TableCell className="px-4 py-3 font-mono text-foreground">{quote.totalAmount}</TableCell>
                <TableCell className="px-4 py-3">
                  <QuoteStatusBadge status={quote.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Desktop-only pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} quotes)
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
            <div className="text-center text-muted-foreground py-8">
              {hasFilters ? (
                <span className="text-muted-foreground">No quotes match your filters.</span>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="font-medium text-foreground">No quotes yet</p>
                  <p className="text-muted-foreground">Create your first quote.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {rows.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="block rounded-lg border border-border hover:bg-muted transition-colors hover:shadow-md"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{quote.quoteNumber}</h3>
                        <p className="text-sm text-muted-foreground">{quote.customer?.name ?? "—"}</p>
                      </div>
                      <div className="text-right text-sm space-y-1">
                        <div className="font-mono text-foreground">{quote.totalAmount}</div>
                        <div className="text-muted-foreground">
                          <QuoteStatusBadge status={quote.status} className="ml-2" />
                        </div>
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