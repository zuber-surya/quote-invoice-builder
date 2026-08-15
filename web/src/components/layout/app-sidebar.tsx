import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground lg:flex">
      <Link href="/dashboard" className="px-2 py-1 font-heading text-lg font-semibold">
        Quote & Invoice Builder
      </Link>

      <Button
        asChild
        className="justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80"
      >
        <Link href="/quotes/new">
          <Plus />
          Create Quote
        </Link>
      </Button>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} label={label} icon={<Icon className="size-4 shrink-0" />} />
        ))}
      </nav>
    </aside>
  );
}
