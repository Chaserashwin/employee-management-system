export function AccessDenied() {
  return (
    <div className="rounded-lg border bg-background p-6">
      <h1 className="text-lg font-semibold">Access denied</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You do not have permission to view this page.
      </p>
    </div>
  );
}
