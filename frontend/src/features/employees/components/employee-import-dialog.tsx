"use client";

import { FileDown, Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useImportEmployees,
  usePreviewEmployeeImport,
} from "@/features/employees/hooks/use-employees";
import { showToast } from "@/lib/toast";
import { employeeService } from "@/services/employee.service";
import type { EmployeeCsvImportPreview } from "@/types/employee";
import { getApiErrorMessage } from "@/utils/api-error";

type EmployeeImportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const summaryItems = [
  ["Rows", "rows"],
  ["Valid", "valid"],
  ["Invalid", "invalid"],
  ["Duplicates", "duplicates"],
  ["Skipped", "skipped"],
] as const;

export function EmployeeImportDialog({ isOpen, onClose }: EmployeeImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<EmployeeCsvImportPreview | null>(null);
  const previewMutation = usePreviewEmployeeImport();
  const importMutation = useImportEmployees();
  const isPending = previewMutation.isPending || importMutation.isPending;

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleTemplateDownload = async () => {
    try {
      const blob = await employeeService.downloadImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "employee-import-template.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  const handlePreview = async () => {
    if (!file) {
      return;
    }

    try {
      const nextPreview = await previewMutation.mutateAsync(file);

      setPreview(nextPreview);
      showToast.success("CSV preview generated.");
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  const handleImport = async () => {
    if (!file) {
      return;
    }

    try {
      const result = await importMutation.mutateAsync(file);

      setPreview(result);
      showToast.success(`Imported ${result.summary.imported} employees.`);

      if (result.summary.imported > 0) {
        onClose();
      }
    } catch (error) {
      showToast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg border bg-background shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-import-title"
      >
        <div className="flex items-start justify-between gap-3 border-b p-5">
          <div>
            <h2 id="employee-import-title" className="text-base font-semibold">
              Import Employees
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload a CSV, review validation results, then import valid rows.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <div className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="employee-import-file">CSV file</Label>
              <Input
                id="employee-import-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setFile(event.currentTarget.files?.item(0) ?? null);
                  setPreview(null);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void handleTemplateDownload()}>
                <FileDown className="size-4" aria-hidden="true" />
                Template
              </Button>
              <Button type="button" disabled={!file || isPending} onClick={() => void handlePreview()}>
                {previewMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-4" aria-hidden="true" />
                )}
                Preview
              </Button>
            </div>
          </div>

          {preview ? (
            <>
              <div className="grid gap-3 sm:grid-cols-5">
                {summaryItems.map(([label, key]) => (
                  <div className="rounded-md border p-3" key={key}>
                    <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                    <p className="mt-2 text-xl font-semibold">{preview.summary[key]}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="max-h-80 overflow-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="sticky top-0 border-b bg-muted text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Row</th>
                        <th className="px-4 py-3 font-medium">Employee ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {preview.rows.map((row) => (
                        <tr key={row.rowNumber} className="align-top">
                          <td className="px-4 py-3">{row.rowNumber}</td>
                          <td className="px-4 py-3">{row.data.employeeId}</td>
                          <td className="px-4 py-3">{row.data.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.data.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant={row.isValid ? "success" : "warning"}>
                              {row.isValid ? "Valid" : "Skipped"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {row.errors.length > 0 ? (
                              <div className="space-y-1 text-xs text-destructive">
                                {row.errors.map((error) => (
                                  <p key={error}>{error}</p>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Ready to import</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t p-5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!file || !preview || preview.summary.valid === 0 || isPending}
            onClick={() => void handleImport()}
          >
            {importMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Import Valid Rows
          </Button>
        </div>
      </div>
    </div>
  );
}
