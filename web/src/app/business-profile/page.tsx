import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { BusinessProfileForm } from "./business-profile-form";

// docs/UI-UX Specification.md sections 17 & 43 — this page serves both the
// post-registration "Business Profile Setup" step and later edits from Settings.
export default async function BusinessProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  const isFirstTimeSetup = !profile;

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">
          {isFirstTimeSetup ? "Set up your business" : "Business Profile"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          This information appears on every quote and invoice you generate.
        </p>

        <BusinessProfileForm
          isFirstTimeSetup={isFirstTimeSetup}
          initialValues={{
            businessName: profile?.businessName ?? "",
            logoUrl: profile?.logoUrl ?? "",
            ownerName: profile?.ownerName ?? "",
            email: profile?.email ?? user.email ?? "",
            phone: profile?.phone ?? "",
            address: profile?.address ?? "",
            city: profile?.city ?? "",
            state: profile?.state ?? "",
            country: profile?.country ?? "",
            postalCode: profile?.postalCode ?? "",
            taxNumber: profile?.taxNumber ?? "",
            website: profile?.website ?? "",
            currency: profile?.currency ?? "INR",
          }}
        />
      </div>
    </div>
  );
}
