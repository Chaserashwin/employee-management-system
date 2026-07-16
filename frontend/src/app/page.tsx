import { APP_NAME } from "@/constants/app";

export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center rounded-lg border border-dashed bg-background p-6 text-center">
      <div className="max-w-xl space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Content Area
        </p>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
          {APP_NAME}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          The application shell is ready for future modules. Business workflows,
          dashboards, authentication, and data features are intentionally not implemented in
          Phase 1.
        </p>
      </div>
    </section>
  );
}
