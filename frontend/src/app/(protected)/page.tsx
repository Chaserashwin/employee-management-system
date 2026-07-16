import { Users } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";

export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center rounded-lg border border-dashed bg-background p-6 text-center">
      <div className="max-w-xl space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Protected Content Area
        </p>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
          {APP_NAME}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Authentication and employee management are active. Dashboard analytics and
          organization hierarchy remain outside this phase.
        </p>
        <Button asChild>
          <Link href="/employees">
            <Users className="size-4" aria-hidden="true" />
            Open Employees
          </Link>
        </Button>
      </div>
    </section>
  );
}
