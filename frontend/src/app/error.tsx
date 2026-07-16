"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-medium uppercase text-muted-foreground">500</p>
        <h1 className="text-3xl font-semibold tracking-normal">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          The application hit an unexpected error. Try again or return later.
        </p>
        <Button type="button" onClick={reset}>
          Try Again
        </Button>
      </div>
    </main>
  );
}
