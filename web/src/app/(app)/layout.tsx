import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

// Shared shell for every authenticated route (sidebar + header + footer). This is a UX
// nicety that skips rendering the whole shell for a request that's about to redirect —
// it does NOT replace each page's own getCurrentUser()/redirect("/login") check
// (CLAUDE.md rule 11 — ownership/auth checks are defense in depth, never redundant).
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
    select: { businessName: true },
  });

  return (
    <div className="flex flex-1">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader user={user} />
        <main className="flex flex-1 flex-col">{children}</main>
        <AppFooter businessName={profile?.businessName ?? null} />
      </div>
    </div>
  );
}
