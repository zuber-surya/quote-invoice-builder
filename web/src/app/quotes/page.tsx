import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { QuoteList } from "./quote-list";

// docs/UI-UX Specification.md section 26.
export default async function QuotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Quotes</h1>
        <p className="mt-1 text-sm text-zinc-500">Create and track quotations for your customers.</p>
      </div>
      <QuoteList />
    </div>
  );
}
