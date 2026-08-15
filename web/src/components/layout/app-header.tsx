import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export function AppHeader({ user }: { user: { name: string | null; email: string | null } }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/dashboard" className="font-heading text-base font-semibold text-foreground lg:hidden">
          Quote & Invoice Builder
        </Link>
      </div>
      <UserMenu user={user} />
    </header>
  );
}
