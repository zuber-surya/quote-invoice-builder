"use client";

import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./nav-link";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-3/4 border-sidebar-border bg-sidebar text-sidebar-foreground sm:max-w-xs"
      >
        <SheetHeader>
          <SheetTitle>Quote & Invoice Builder</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <SheetClose asChild>
            <Button
              asChild
              className="justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80"
            >
              <Link href="/quotes/new">
                <Plus />
                Create Quote
              </Link>
            </Button>
          </SheetClose>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <SheetClose asChild key={href}>
                <NavLink href={href} label={label} icon={<Icon className="size-4 shrink-0" />} />
              </SheetClose>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
