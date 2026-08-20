"use client";

import * as React from "react";
import { Mail, Plus, ShieldAlert, ShieldCheck, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useInviteStaff, useRoles, useStaff } from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
import { formatRelative } from "@/lib/format";
import type { User } from "@/lib/api/types";

const PAGE_SIZE = 25;

export default function StaffPage() {
  const { page, setPage, search, setSearch, debounced } = useTableState();
  const query = useStaff({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    ordering: "-created_at",
  });

  const roles = useRoles();
  const invite = useInviteStaff();

  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [roleId, setRoleId] = React.useState("");

  const columns: Column<User>[] = [
    {
      id: "user",
      header: "Person",
      cell: (row) => {
        const initials =
          `${row.first_name?.[0] ?? ""}${row.last_name?.[0] ?? ""}`.toUpperCase() ||
          row.email[0]?.toUpperCase();
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-muted text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.full_name || "—"}</p>
              <p className="truncate text-xs text-muted-foreground">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "roles",
      header: "Roles",
      cell: (row) =>
        row.is_superuser ? (
          <Badge className="bg-violet-500/10 text-violet-700 hover:bg-violet-500/10 dark:text-violet-400">
            Super Admin
          </Badge>
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.roles?.length ? (
              row.roles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No role</span>
            )}
          </div>
        ),
    },
    {
      id: "mfa",
      header: "2FA",
      cell: (row) =>
        row.mfa_enabled ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            On
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-4" />
            Off
          </span>
        ),
    },
    {
      id: "last_login",
      header: "Last seen",
      secondary: true,
      align: "right",
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.last_login ? formatRelative(row.last_login) : "Never"}
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      align: "right",
      cell: (row) =>
        row.is_active ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="destructive">Suspended</Badge>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Staff"
        description="Internal XerinPay accounts and what each of them can reach."
        actions={
          <Can I="staff.create">
            <Button onClick={() => setOpen(true)}>
              <UserPlus className="size-4" />
              Invite
            </Button>
          </Can>
        }
      />

      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Name or email…"
        rowKey={(row) => row.id}
        emptyTitle="No staff accounts"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a colleague</DialogTitle>
            <DialogDescription>
              They&apos;ll receive an email to set a password and enrol a second
              factor before they can sign in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Work email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@xerinpay.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.data?.results.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Grant the narrowest role that lets them do their job. You can
                always widen it later.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!email.includes("@") || !roleId || invite.isPending}
              onClick={() =>
                invite.mutate(
                  { email: email.trim().toLowerCase(), role: roleId },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setEmail("");
                      setRoleId("");
                    },
                  },
                )
              }
            >
              <Mail className="size-4" />
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
