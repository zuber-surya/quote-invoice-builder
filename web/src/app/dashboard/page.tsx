import { auth } from "@/lib/auth";

// Placeholder dashboard — full implementation (summary cards, recent quotes/invoices,
// + Create Quote action) lands in Phase 10 per docs/Code & Development Workflow.md.
// This page exists now so Phase 1 has a protected route to verify auth end-to-end.
export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col p-8">
      <h1 className="text-xl font-semibold text-zinc-900">
        Good morning{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Dashboard content (summary cards, recent quotes/invoices) is not built yet.
      </p>
    </div>
  );
}
