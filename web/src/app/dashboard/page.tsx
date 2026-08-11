import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/get-dashboard-data";
import { QuoteStatusBadge } from "../quotes/quote-status-badge";
import { InvoiceStatusBadge } from "../invoices/invoice-status-badge";

// docs/API Specification.md sections 54-56. UI-UX Spec dashboard mockups: greeting,
// primary "Create Quote" action, four summary cards, Recent Quotes, Recent Invoices.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  // PRD core flow: Register → Business Profile Setup → Dashboard.
  if (!profile) redirect("/business-profile");

  const data = await getDashboardData(user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-zinc-900">
          Good morning{user.name ? `, ${user.name}` : ""}
        </h1>
        <Link
          href="/quotes/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Create Quote
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Quotes" value={String(data.totalQuotes)} href="/quotes" />
        <SummaryCard label="Total Invoices" value={String(data.totalInvoices)} href="/invoices" />
        <SummaryCard label="Paid Amount" value={data.paidAmount} href="/invoices" />
        <SummaryCard label="Outstanding Amount" value={data.outstandingAmount} href="/invoices" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentQuotes quotes={data.recentQuotes} />
        <RecentInvoices invoices={data.recentInvoices} />
      </div>

      <div className="flex w-fit gap-4 text-sm">
        <Link href="/customers" className="font-medium text-zinc-500 underline">
          Manage Customers
        </Link>
        <Link href="/products" className="font-medium text-zinc-500 underline">
          Manage Products
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
    >
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
    </Link>
  );
}

type RecentQuote = {
  id: string;
  quoteNumber: string;
  quoteDate: string;
  status: string;
  totalAmount: string;
  customer?: { name: string } | null;
};

function RecentQuotes({ quotes }: { quotes: RecentQuote[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Recent Quotes</h2>
        <Link href="/quotes" className="text-xs font-medium text-zinc-500 underline">
          View all
        </Link>
      </div>
      {quotes.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No quotes yet. Create your first quote.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <Link
                href={`/quotes/${quote.id}`}
                className="flex items-center justify-between gap-2 py-2 text-sm hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium text-zinc-900">{quote.quoteNumber}</p>
                  <p className="text-xs text-zinc-500">{quote.customer?.name ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">{quote.totalAmount}</span>
                  <QuoteStatusBadge status={quote.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type RecentInvoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: string;
  remainingAmount: string;
  customer?: { name: string } | null;
};

function RecentInvoices({ invoices }: { invoices: RecentInvoice[] }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Recent Invoices</h2>
        <Link href="/invoices" className="text-xs font-medium text-zinc-500 underline">
          View all
        </Link>
      </div>
      {invoices.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No invoices yet. Invoices will appear here after you create them.</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <Link
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-2 py-2 text-sm hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium text-zinc-900">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-zinc-500">{invoice.customer?.name ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">{invoice.totalAmount}</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
