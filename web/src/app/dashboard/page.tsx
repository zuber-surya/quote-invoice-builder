import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";

// Placeholder dashboard — full implementation (summary cards, recent quotes/invoices,
// + Create Quote action) lands in Phase 10 per docs/Code & Development Workflow.md.
// This page exists now so earlier phases have a protected route to verify auth end-to-end.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  // PRD core flow: Register → Business Profile Setup → Dashboard.
  if (!profile) redirect("/business-profile");

  return (
    <div className="flex flex-1 flex-col p-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Good morning{user.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Dashboard content (summary cards, recent quotes/invoices) is not built yet.
      </p>
      <div className="mt-4 flex w-fit gap-4">
        <Link href="/customers" className="text-sm font-medium text-zinc-900 underline">
          Manage Customers
        </Link>
        <Link href="/products" className="text-sm font-medium text-zinc-900 underline">
          Manage Products
        </Link>
      </div>
    </div>
  );
}
