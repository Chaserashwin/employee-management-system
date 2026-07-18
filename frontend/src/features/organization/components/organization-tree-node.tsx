"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { memo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import type { OrganizationTreeNode } from "@/types/employee";

type OrganizationTreeNodeProps = {
  node: OrganizationTreeNode;
  onSelect: (node: OrganizationTreeNode) => void;
  selectedId?: string;
};

const containsNodeId = (node: OrganizationTreeNode, selectedId: string | undefined): boolean => {
  if (!selectedId) {
    return false;
  }

  return node.id === selectedId || node.reportees.some((reportee) => containsNodeId(reportee, selectedId));
};

function OrganizationTreeNodeComponent({
  node,
  onSelect,
  selectedId,
}: OrganizationTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasReportees = node.reportees.length > 0;

  return (
    <div className="min-w-0 space-y-2">
      <div
        className={`flex min-w-0 items-center gap-2 rounded-lg border bg-background p-2.5 sm:gap-3 sm:p-3 ${
          selectedId === node.id ? "ring-1 ring-primary" : ""
        }`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 sm:size-8"
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
          className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left sm:gap-3"
          onClick={() => onSelect(node)}
        >
          <EmployeeAvatar employee={node} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{node.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {node.employeeId} - {node.department} - {node.designation}
            </span>
          </span>
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <Badge variant="muted">{node.role}</Badge>
          <Badge variant={node.status === "ACTIVE" ? "success" : "warning"}>{node.status}</Badge>
        </div>
      </div>

      {hasReportees && isExpanded ? (
        <div className="ml-3 space-y-2 border-l pl-3 sm:ml-5 sm:pl-4">
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

export const OrganizationTreeNodeView = memo(
  OrganizationTreeNodeComponent,
  (previous, next) =>
    previous.node === next.node &&
    previous.onSelect === next.onSelect &&
    containsNodeId(previous.node, previous.selectedId) ===
      containsNodeId(next.node, next.selectedId),
);
