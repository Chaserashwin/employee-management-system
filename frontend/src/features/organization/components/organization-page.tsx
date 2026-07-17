"use client";

import { useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { formatEmployeeDate } from "@/features/employees/utils/employee-format";
import { OrganizationTreeNodeView } from "@/features/organization/components/organization-tree-node";
import { useOrganizationTree } from "@/features/organization/hooks/use-organization-tree";
import { getApiErrorMessage } from "@/utils/api-error";
import type { OrganizationTreeNode } from "@/types/employee";

export function OrganizationPage() {
  const treeQuery = useOrganizationTree();
  const [selectedNode, setSelectedNode] = useState<OrganizationTreeNode | null>(null);
  const tree = useMemo(() => treeQuery.data ?? [], [treeQuery.data]);
  const activeNode = useMemo(() => selectedNode ?? tree[0] ?? null, [selectedNode, tree]);
  const handleSelectNode = useCallback((node: OrganizationTreeNode) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Organization</h1>
        <p className="text-sm text-muted-foreground">
          View reporting structure, managers, and direct reportees.
        </p>
      </div>

      {treeQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {getApiErrorMessage(treeQuery.error)}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {treeQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="ml-8 h-16 w-[calc(100%-2rem)]" />
                <Skeleton className="ml-8 h-16 w-[calc(100%-2rem)]" />
              </div>
            ) : tree.length > 0 ? (
              <div className="space-y-2">
                {tree.map((node) => (
                  <OrganizationTreeNodeView
                    key={node.id}
                    node={node}
                    selectedId={activeNode?.id}
                    onSelect={handleSelectNode}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-14 text-center">
                <p className="text-sm font-medium">No hierarchy found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Assign managers to build the organization tree.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg tracking-normal">Employee Details</CardTitle>
          </CardHeader>
          <CardContent>
            {activeNode ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <EmployeeAvatar employee={activeNode} size="lg" />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">{activeNode.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">
                      {activeNode.employeeId} - {activeNode.designation}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="muted">{activeNode.role}</Badge>
                  <Badge variant={activeNode.status === "ACTIVE" ? "success" : "warning"}>
                    {activeNode.status}
                  </Badge>
                  <Badge variant="default">
                    {activeNode.manager ? "Has Manager" : "Top Level"}
                  </Badge>
                </div>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">Email</dt>
                    <dd className="mt-1 break-all">{activeNode.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">Phone</dt>
                    <dd className="mt-1">{activeNode.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                      Department
                    </dt>
                    <dd className="mt-1">{activeNode.department}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                      Manager
                    </dt>
                    <dd className="mt-1">{activeNode.manager?.name ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                      Direct Reportees
                    </dt>
                    <dd className="mt-1">{activeNode.directReporteesCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                      Joining Date
                    </dt>
                    <dd className="mt-1">{formatEmployeeDate(activeNode.joiningDate)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a tree node to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
