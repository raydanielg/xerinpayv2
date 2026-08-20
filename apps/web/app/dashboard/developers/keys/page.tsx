"use client";

import * as React from "react";
import { AlertTriangle, Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
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
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
import { formatDate, formatRelative } from "@/lib/format";
import type { ApiKey } from "@/lib/api/types";

const PAGE_SIZE = 25;

/**
 * The secret is shown exactly once, at creation.
 *
 * We never persist it client-side and the list endpoint only ever returns the
 * prefix. If a merchant loses the key, the answer is to rotate — not to look it
 * up — which is the only design that keeps the stored value hashed.
 */
function SecretReveal({
  apiKey,
  onClose,
}: {
  apiKey: ApiKey | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <Dialog open={Boolean(apiKey)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Copy your secret key now</DialogTitle>
          <DialogDescription>
            This is the only time it will be shown. Store it in your server&apos;s
            environment, never in client-side code or version control.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/60 p-3">
          <code className="min-w-0 flex-1 break-all font-mono text-sm">
            {apiKey?.secret ?? "—"}
          </code>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Copy secret key"
            onClick={async () => {
              if (!apiKey?.secret) return;
              try {
                await navigator.clipboard.writeText(apiKey.secret);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                toast.error("Could not copy — select the text manually.");
              }
            }}
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="size-4" />
          <AlertDescription>
            Anyone holding this key can charge your customers. If it leaks, revoke
            it here immediately.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button onClick={onClose}>I&apos;ve stored it safely</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ApiKeysPage() {
  const { page, setPage } = useTableState();
  const query = useApiKeys({ page, page_size: PAGE_SIZE, ordering: "-created_at" });

  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [environment, setEnvironment] = React.useState("sandbox");
  const [revealed, setRevealed] = React.useState<ApiKey | null>(null);
  const [revoking, setRevoking] = React.useState<ApiKey | null>(null);

  async function create() {
    const created = await createKey
      .mutateAsync({ name: name.trim(), environment })
      .catch(() => null);

    if (created) {
      setCreateOpen(false);
      setName("");
      setRevealed(created);
    }
  }

  const columns: Column<ApiKey>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {row.prefix}••••••••
          </p>
        </div>
      ),
    },
    {
      id: "environment",
      header: "Environment",
      cell: (row) => (
        <Badge
          variant="outline"
          className={
            row.environment === "live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }
        >
          {row.environment === "live" ? "Live" : "Sandbox"}
        </Badge>
      ),
    },
    {
      id: "last_used",
      header: "Last used",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.last_used_at ? formatRelative(row.last_used_at) : "Never"}
        </span>
      ),
    },
    {
      id: "created",
      header: "Created",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatDate(row.created_at)}
          {row.created_by ? ` · ${row.created_by}` : ""}
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) =>
        row.is_active ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="destructive">Revoked</Badge>
        ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (row) =>
        row.is_active ? (
          <Can I="developer.keys.revoke">
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setRevoking(row)}
            >
              <Trash2 className="size-4" />
              Revoke
            </Button>
          </Can>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="API keys"
        description="Secret keys authenticate your server to the XerinPay API."
        actions={
          <Can I="developer.keys.create">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create key
            </Button>
          </Can>
        }
      />

      <Alert>
        <KeyRound className="size-4" />
        <AlertTitle>Keep secret keys on your server</AlertTitle>
        <AlertDescription>
          A secret key in browser JavaScript or a mobile app is a leaked key. Call
          the API from your backend, and use webhooks to learn the outcome.
        </AlertDescription>
      </Alert>

      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        rowKey={(row) => row.id}
        emptyTitle="No API keys yet"
        emptyDescription="Create a sandbox key to start testing your integration."
      />

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Name it after where it runs, so you know what breaks if you revoke it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Production checkout server"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-env">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger id="key-env">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox — test payments only</SelectItem>
                  <SelectItem value="live">Live — moves real money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={create}
              disabled={name.trim().length < 2 || createKey.isPending}
            >
              Create key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SecretReveal apiKey={revealed} onClose={() => setRevealed(null)} />

      {/* Revoke */}
      <AlertDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => !open && setRevoking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke &ldquo;{revoking?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Any request using this key starts failing immediately. This cannot be
              undone — you would need to create a new key and redeploy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={revokeKey.isPending}
              onClick={() => {
                if (!revoking) return;
                revokeKey.mutate(revoking.id, { onSuccess: () => setRevoking(null) });
              }}
            >
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
