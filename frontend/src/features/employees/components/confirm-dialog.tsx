"use client";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  confirmLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  description: string;
  isOpen: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog({
  confirmLabel = "Delete",
  confirmVariant = "destructive",
  description,
  isOpen,
  isPending = false,
  onCancel,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-lg border bg-background p-5 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="space-y-2">
          <h2 id="confirm-dialog-title" className="text-base font-semibold">
            {title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant={confirmVariant} onClick={onConfirm} disabled={isPending}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
