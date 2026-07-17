import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md space-y-5 rounded-lg border bg-background p-6">
        <Skeleton className="mx-auto size-12" />
        <Skeleton className="mx-auto h-7 w-56" />
        <Skeleton className="mx-auto h-4 w-72 max-w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </main>
  );
}
