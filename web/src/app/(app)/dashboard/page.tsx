import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Package,
  Plus,
  Receipt,
  Users,
  Wallet,
  WalletCards,
} from "lucide-react";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/get-dashboard-data";
import { QuoteStatusBadge } from "../quotes/quote-status-badge";
import { InvoiceStatusBadge } from "../invoices/invoice-status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STAT_CARDS = [
  { key: "totalQuotes", label: "Total Quotes", href: "/quotes", icon: FileText } as const,
  { key: "totalInvoices", label: "Total Invoices", href: "/invoices", icon: Receipt } as const,
  { key: "paidAmount", label: "Paid Amount", href: "/invoices", icon: Wallet } as const,
  { key: "outstandingAmount", label: "Outstanding Amount", href: "/invoices", icon: WalletCards } as const,
];

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
    <div className="flex flex-1 flex-col gap-6 bg-background p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Good morning{user.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <Button asChild>
          <Link href="/quotes/new">
            <Plus />
            Create Quote
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, href, icon: Icon }) => (
          <Link key={key} href={href} className="group block">
            <Card className="h-full transition-colors group-hover:ring-primary/40">
              <CardContent className="flex items-center gap-4 px-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {label}
                  </p>
                  <p className="mt-0.5 font-mono text-xl font-semibold text-foreground">
                    {data[key]}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Quotes</CardTitle>
              <Link
                href="/quotes"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentQuotes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No quotes yet. Create your first quote.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentQuotes.map((quote) => (
                  <li key={quote.id}>
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{quote.quoteNumber}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {quote.customer?.name ?? "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-foreground">{quote.totalAmount}</span>
                        <QuoteStatusBadge status={quote.status} />
                        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Link
                href="/invoices"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentInvoices.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No invoices yet. Invoices will appear here after you create them.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentInvoices.map((invoice) => (
                  <li key={invoice.id}>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {invoice.customer?.name ?? "—"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-foreground">{invoice.totalAmount}</span>
                        <InvoiceStatusBadge status={invoice.status} />
                        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex w-fit gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/customers">
            <Users />
            Manage Customers
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/products">
            <Package />
            Manage Products
          </Link>
        </Button>
      </div>
    </div>
  );
}