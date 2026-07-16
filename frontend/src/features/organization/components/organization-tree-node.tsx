"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import type { OrganizationTreeNode } from "@/types/employee";

type OrganizationTreeNodeProps = {
  node: OrganizationTreeNode;
  onSelect: (node: OrganizationTreeNode) => void;
  selectedId?: string;
};

export function OrganizationTreeNodeView({
  node,
  onSelect,
  selectedId,
}: OrganizationTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasReportees = node.reportees.length > 0;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 rounded-lg border bg-background p-3 ${
          selectedId === node.id ? "ring-1 ring-primary" : ""
        }`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={!hasReportees}
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          aria-label={isExpanded ? "Collapse reportees" : "Expand reportees"}
        >
          {hasReportees && isExpanded ? (
            <ChevronDown className="size-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4" aria-hidden="true" />
          )}
        </Button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => onSelect(node)}
        >
          <EmployeeAvatar employee={node} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{node.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {node.employeeId} - {node.designation}
            </span>
          </span>
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <Badge variant="muted">{node.role}</Badge>
          <Badge variant={node.status === "ACTIVE" ? "success" : "warning"}>{node.status}</Badge>
        </div>
      </div>

      {hasReportees && isExpanded ? (
        <div className="ml-5 space-y-2 border-l pl-4">
          {node.reportees.map((reportee) => (
            <OrganizationTreeNodeView
              key={reportee.id}
              node={reportee}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
