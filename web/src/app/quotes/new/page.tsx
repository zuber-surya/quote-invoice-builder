import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { QuoteForm } from "../quote-form";

// docs/UI-UX Specification.md section 28.
export default async function NewQuotePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 flex-col p-8">
      <h1 className="text-xl font-semibold text-zinc-900">Create Quote</h1>
      <div className="mt-6">
        <QuoteForm mode="create" />
      </div>
    </div>
  );
}
