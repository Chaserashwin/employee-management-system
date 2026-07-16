"use client";

import {
  Building2,
  CircleDot,
  GitFork,
  LogOut,
  PanelLeft,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";
import { GlobalSearch } from "@/features/search/components/global-search";
import { useAuth } from "@/hooks/use-auth";
import type { NavigationItem } from "@/types/navigation";

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: CircleDot,
    roles: ["SUPER_ADMIN", "HR"],
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["SUPER_ADMIN", "HR"],
  },
  {
    title: "Organization",
    href: "/organization",
    icon: GitFork,
    roles: ["SUPER_ADMIN", "HR"],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: UserRound,
    roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "HR", "EMPLOYEE"],
  },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { logout, role, user } = useAuth();
  const pathname = usePathname();
  const canUseGlobalSearch = role === "SUPER_ADMIN" || role === "HR";
  const visibleNavigationItems = navigationItems.filter((item) =>
    role ? item.roles.includes(role) : false,
  );

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{APP_NAME}</p>
            <p className="truncate text-xs text-muted-foreground">Foundation</p>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 space-y-1 px-3 py-4">
          {visibleNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
                href={item.href}
                key={item.title}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <PanelLeft className="size-5 text-muted-foreground md:hidden" aria-hidden="true" />
          {canUseGlobalSearch ? <GlobalSearch /> : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Application Shell</p>
            <p className="truncate text-xs text-muted-foreground">Employee operations</p>
          </div>
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out">
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
