import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-medium uppercase text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold tracking-normal">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you requested does not exist or may have moved.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </main>
  );
}
