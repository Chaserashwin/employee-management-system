import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
};
