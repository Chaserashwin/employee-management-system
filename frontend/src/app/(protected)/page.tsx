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
          Authentication is active. Future dashboard, employee, hierarchy, and reporting
          modules can be added here without changing the route protection foundation.
        </p>
      </div>
    </section>
  );
}
