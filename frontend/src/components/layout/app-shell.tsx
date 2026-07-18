"use client";

import {
  Building2,
  CircleDot,
  GitFork,
  LogOut,
  Menu,
  Settings,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";
import { GlobalSearch } from "@/features/search/components/global-search";
import { useAuth } from "@/hooks/use-auth";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";
import type { NavigationItem } from "@/types/navigation";

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
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
    title: "Recycle Bin",
    href: "/employees/recycle-bin",
    icon: Trash2,
    roles: ["SUPER_ADMIN"],
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

const SWIPE_CLOSE_THRESHOLD = 48;

export function AppShell({ children }: AppShellProps) {
  const { logout, role, user } = useAuth();
  const pathname = usePathname();
  const { prefetchRoute, startRouteNavigation } = useRoutePrefetch();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const canUseGlobalSearch = role === "SUPER_ADMIN" || role === "HR";
  const visibleNavigationItems = navigationItems.filter((item) =>
    role ? item.roles.includes(role) : false,
  );

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  useEffect(() => {
    closeMobileSidebar();
  }, [closeMobileSidebar, pathname]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileSidebar, isMobileSidebarOpen]);

  const getIsActiveNavigationItem = (href: string) =>
    href === "/"
      ? pathname === href
      : href === "/employees"
        ? !pathname.startsWith("/employees/recycle-bin") &&
          (pathname === href || /^\/employees\/(new|[^/]+)(\/edit)?$/.test(pathname))
        : pathname === href ||
          pathname.startsWith(`${href}/`) ||
          (href === "/dashboard" && pathname === "/");

  const handleNavigationClick = (href: string, shouldCloseMobileSidebar = false) => {
    if (shouldCloseMobileSidebar) {
      closeMobileSidebar();
    }

    startRouteNavigation(href);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches.item(0);

    if (!touch) {
      return;
    }

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const touch = event.changedTouches.item(0);

    if (!touch || touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (deltaX < -SWIPE_CLOSE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      closeMobileSidebar();
    }
  };

  const renderNavigationLinks = (variant: "desktop" | "mobile") =>
    visibleNavigationItems.map((item) => {
      const Icon = item.icon;
      const isActive = getIsActiveNavigationItem(item.href);
      const isMobile = variant === "mobile";

      return (
        <Link
          className={`flex items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
            isMobile ? "py-3" : "py-2"
          } ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
          href={item.href}
          key={item.title}
          onClick={() => handleNavigationClick(item.href, isMobile)}
          onFocus={() => prefetchRoute(item.href)}
          onMouseEnter={() => prefetchRoute(item.href)}
        >
          <Icon className="size-4" aria-hidden="true" />
          <span>{item.title}</span>
        </Link>
      );
    });

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
          {renderNavigationLinks("desktop")}
        </nav>
      </aside>

      {isMobileSidebarOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={closeMobileSidebar}
            aria-label="Close navigation menu"
          />
          <aside
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-3rem))] flex-col border-r bg-background shadow-xl animate-in slide-in-from-left duration-200 md:hidden"
            aria-label="Mobile primary navigation"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex h-16 items-center gap-3 border-b px-4">
              <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{APP_NAME}</p>
                <p className="truncate text-xs text-muted-foreground">Foundation</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                onClick={closeMobileSidebar}
                aria-label="Close navigation menu"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <nav aria-label="Mobile primary navigation" className="flex-1 space-y-1 px-3 py-4">
              {renderNavigationLinks("mobile")}
            </nav>
          </aside>
        </>
      ) : null}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur sm:gap-3 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 md:hidden"
            onClick={openMobileSidebar}
            aria-controls="mobile-sidebar"
            aria-expanded={isMobileSidebarOpen}
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
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
          <Button
            variant="ghost"
            size="icon"
            className="size-10 sm:size-9"
            onClick={() => void logout()}
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </header>

        <main className="p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
