"use client";

import * as React from "react";
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

import { useSaveRole } from "@/lib/api/queries";
import {
  MODULE_LABELS,
  PERMISSIONS,
  type PermissionModule,
  findConflicts,
  permissionLabel,
  requiresStepUp,
} from "@/lib/rbac/permissions";
import type { Role } from "@/lib/api/types";

/**
 * Dynamic role builder.
 *
 * An administrator composes a role out of individual permissions — no preset
 * role list, no code change to add "Senior Finance Officer". Two things make it
 * safe rather than merely flexible:
 *
 *   1. Segregation-of-duties conflicts are surfaced as you tick, with the
 *      reason spelled out. The save is not blocked — a five-person company
 *      sometimes has no choice — but the decision becomes deliberate and lands
 *      in the audit log.
 *   2. Permissions that can move money or grant access are marked, so the
 *      person building the role can see the blast radius before saving.
 */
export function RoleBuilder({
  open,
  onOpenChange,
  role,
  scope = "staff",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  scope?: "staff" | "merchant";
}) {
  const save = useSaveRole();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!open) return;
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setSelected(new Set(role?.permissions ?? []));
  }, [open, role]);

  const toggle = React.useCallback((permission: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  }, []);

  const toggleModule = React.useCallback((module: PermissionModule, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const permission of PERMISSIONS[module]) {
        if (on) next.add(permission);
        else next.delete(permission);
      }
      return next;
    });
  }, []);

  const conflicts = React.useMemo(() => findConflicts([...selected]), [selected]);
  const modules = Object.keys(PERMISSIONS) as PermissionModule[];
  const canSave = name.trim().length >= 2 && selected.size > 0;

  async function submit() {
    await save
      .mutateAsync({
        id: role?.id,
        data: {
          name: name.trim(),
          description: description.trim(),
          scope,
          permissions: [...selected],
        },
      })
      .then(() => onOpenChange(false))
      .catch(() => {
        /* toast already surfaced */
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border/60 p-6">
          <DialogTitle>{role ? "Edit role" : "Create role"}</DialogTitle>
          <DialogDescription>
            Pick exactly what this role can do. Everything not ticked is denied.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60svh]">
          <div className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role name</Label>
                <Input
                  id="role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Senior Finance Officer"
                  disabled={role?.is_system || save.isPending}
                />
                {role?.is_system ? (
                  <p className="text-xs text-muted-foreground">
                    System roles cannot be renamed.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Input
                  id="role-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Manages financial operations"
                  disabled={save.isPending}
                />
              </div>
            </div>

            {conflicts.length > 0 ? (
              <Alert>
                <AlertTriangle className="size-4" />
                <AlertTitle>Separation of duties warning</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {conflicts.map((conflict) => (
                      <li key={`${conflict.a}-${conflict.b}`} className="text-sm">
                        <span className="font-mono text-xs">{conflict.a}</span> +{" "}
                        <span className="font-mono text-xs">{conflict.b}</span> —{" "}
                        {conflict.reason}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">
                    You can still save. The combination will be recorded against
                    your name in the audit log.
                  </p>
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-3">
              {modules.map((module) => {
                const all = PERMISSIONS[module];
                const chosen = all.filter((p) => selected.has(p));
                const allOn = chosen.length === all.length;
                const someOn = chosen.length > 0 && !allOn;

                return (
                  <div
                    key={module}
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      chosen.length > 0 ? "border-border bg-muted/25" : "border-border/60",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`module-${module}`}
                        checked={allOn ? true : someOn ? "indeterminate" : false}
                        onCheckedChange={(value) => toggleModule(module, value === true)}
                        disabled={save.isPending}
                      />
                      <Label
                        htmlFor={`module-${module}`}
                        className="flex-1 cursor-pointer text-sm font-semibold"
                      >
                        {MODULE_LABELS[module]}
                      </Label>
                      {chosen.length > 0 ? (
                        <Badge variant="secondary" className="tabular-nums">
                          {chosen.length}/{all.length}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-2 pl-7 sm:grid-cols-2 lg:grid-cols-3">
                      {all.map((permission) => (
                        <div key={permission} className="flex items-start gap-2">
                          <Checkbox
                            id={permission}
                            checked={selected.has(permission)}
                            onCheckedChange={() => toggle(permission)}
                            disabled={save.isPending}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={permission}
                            className="cursor-pointer text-sm font-normal leading-tight"
                          >
                            {permissionLabel(permission)}
                            {requiresStepUp(permission) ? (
                              <ShieldAlert
                                className="ml-1 inline size-3 text-amber-500"
                                aria-label="Requires re-authentication"
                              />
                            ) : null}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldAlert className="size-3.5 text-amber-500" />
              Marked permissions require the user to re-enter their password and
              second factor before the action goes through.
            </p>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border/60 p-6">
          <div className="mr-auto text-sm text-muted-foreground tabular-nums">
            {selected.size} permission{selected.size === 1 ? "" : "s"} selected
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={save.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave || save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {role ? "Save changes" : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
