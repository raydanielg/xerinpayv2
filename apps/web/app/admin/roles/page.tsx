"use client";

import * as React from "react";
import { Lock, Pencil, Plus, Shield, Trash2, Users } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { RoleBuilder } from "@/components/rbac/role-builder";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useDeleteRole, useRoles } from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
import { MODULE_LABELS, type PermissionModule } from "@/lib/rbac/permissions";
import type { Role } from "@/lib/api/types";

/** Groups a flat permission list into module names for a readable summary. */
function moduleSummary(permissions: string[]): string[] {
  const modules = new Set<string>();
  for (const permission of permissions) {
    const module = permission.split(".")[0] as PermissionModule;
    if (module in MODULE_LABELS) modules.add(MODULE_LABELS[module]);
  }
  return [...modules].sort();
}

export default function RolesPage() {
  const { data, isLoading, error, refetch } = useRoles();
  const deleteRole = useDeleteRole();

  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Role | null>(null);
  const [deleting, setDeleting] = React.useState<Role | null>(null);

  const roles = data?.results ?? [];

  return (
    <>
      <PageHeader
        title="Roles"
        description="Compose roles from individual permissions. Nothing is granted by default."
        actions={
          <Can I="roles.create">
            <Button
              onClick={() => {
                setEditing(null);
                setBuilderOpen(true);
              }}
            >
              <Plus className="size-4" />
              Create role
            </Button>
          </Can>
        }
      />

      {error ? (
        <ErrorState status={error.status} message={error.detail} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No roles yet"
          description="Create your first role to start assigning access to staff."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="gap-0 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 truncate text-base font-semibold tracking-tight">
                    {role.name}
                    {role.is_system ? (
                      <Lock
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-label="System role"
                      />
                    ) : null}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {role.description || "No description"}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 gap-1">
                  <Users className="size-3" />
                  {role.user_count ?? 0}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {moduleSummary(role.permissions ?? [])
                  .slice(0, 6)
                  .map((module) => (
                    <span
                      key={module}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {module}
                    </span>
                  ))}
                {moduleSummary(role.permissions ?? []).length > 6 ? (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    +{moduleSummary(role.permissions ?? []).length - 6} more
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-xs text-muted-foreground tabular-nums">
                {role.permissions?.length ?? 0} permissions
              </p>

              <div className="mt-4 flex gap-2 border-t border-border/60 pt-4">
                <Can I="roles.update">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditing(role);
                      setBuilderOpen(true);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                </Can>
                {!role.is_system ? (
                  <Can I="roles.delete">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(role)}
                      disabled={(role.user_count ?? 0) > 0}
                      title={
                        (role.user_count ?? 0) > 0
                          ? "Reassign the users on this role first"
                          : undefined
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </Can>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoleBuilder open={builderOpen} onOpenChange={setBuilderOpen} role={editing} />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleting?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Anyone currently holding this role loses the
              permissions it grants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteRole.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteRole.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
              }}
            >
              Delete role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
