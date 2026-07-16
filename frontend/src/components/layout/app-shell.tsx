import { Building2, CircleDot, Layers3, PanelLeft, Settings } from "lucide-react";
import type { ReactNode } from "react";

import { APP_NAME } from "@/constants/app";
import type { NavigationItem } from "@/types/navigation";

const navigationItems: NavigationItem[] = [
  {
    title: "Workspace",
    href: "#",
    icon: CircleDot,
  },
  {
    title: "Modules",
    href: "#",
    icon: Layers3,
  },
  {
    title: "Settings",
    href: "#",
    icon: Settings,
  },
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
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
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                href={item.href}
                key={item.title}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.title}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <PanelLeft className="size-5 text-muted-foreground md:hidden" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Application Shell</p>
            <p className="truncate text-xs text-muted-foreground">Phase 1 foundation</p>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
