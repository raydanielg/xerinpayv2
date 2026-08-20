"use client";

import * as React from "react";
import { AlertTriangle, Check, Play } from "lucide-react";

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
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  useReconciliation,
  useResolveRecon,
  useRunReconciliation,
} from "@/lib/api/queries";
import { Can, usePermissions } from "@/lib/rbac/use-permissions";
import { formatDate, formatMoney } from "@/lib/format";
import type { ReconciliationRecord } from "@/lib/api/types";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "MATCHED", label: "Matched" },
  { value: "MISSING_PROVIDER", label: "Missing at provider" },
  { value: "MISSING_XERINPAY", label: "Missing at XerinPay" },
  { value: "AMOUNT_MISMATCH", label: "Amount mismatch" },
  { value: "STATUS_MISMATCH", label: "Status mismatch" },
  { value: "DUPLICATE", label: "Duplicate" },
];

/**
 * Reconciliation is where a gateway finds out it is wrong.
 *
 * The default filter is deliberately "unresolved" — nobody needs to scroll
 * thousands of matched rows; they need the handful that disagree.
 */
export default function ReconciliationPage() {
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ status: "", resolved: "false" });
  const { has } = usePermissions();

  const query = useReconciliation({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    status: filters.status || undefined,
    resolved: filters.resolved || undefined,
    ordering: "-run_date",
  });

  const run = useRunReconciliation();
  const resolve = useResolveRecon();
  const [resolving, setResolving] = React.useState<ReconciliationRecord | null>(null);
  const [notes, setNotes] = React.useState("");

  const columns: Column<ReconciliationRecord>[] = [
    {
      id: "status",
      header: "Finding",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      id: "provider",
      header: "Provider",
      cell: (row) => row.provider?.name ?? "—",
    },
    {
      id: "ours",
      header: "XerinPay ref",
      secondary: true,
      cell: (row) => (
        <span className="font-mono text-xs">{row.our_reference ?? "—"}</span>
      ),
    },
    {
      id: "theirs",
      header: "Provider ref",
      secondary: true,
      cell: (row) => (
        <span className="font-mono text-xs">{row.provider_reference ?? "—"}</span>
      ),
    },
    {
      id: "amounts",
      header: "Amounts",
      align: "right",
      cell: (row) => {
        const mismatch =
          row.our_amount !== null &&
          row.provider_amount !== null &&
          row.our_amount !== row.provider_amount;
        return (
          <span
            className={
              mismatch ? "font-medium text-destructive tabular-nums" : "tabular-nums"
            }
          >
            {formatMoney(row.our_amount, row.currency)}
            {mismatch ? (
              <>
                {" "}
                vs {formatMoney(row.provider_amount, row.currency, { showCode: false })}
              </>
            ) : null}
          </span>
        );
      },
    },
    {
      id: "run",
      header: "Run date",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.run_date)}
        </span>
      ),
    },
    ...(has("reconciliation.resolve")
      ? [
          {
            id: "actions",
            header: <span className="sr-only">Actions</span>,
            align: "right" as const,
            cell: (row: ReconciliationRecord) =>
              row.resolved ? (
                <span className="text-xs text-muted-foreground">
                  {row.resolved_by ?? "Resolved"}
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setResolving(row);
                    setNotes("");
                  }}
                >
                  <Check className="size-4" />
                  Resolve
                </Button>
              ),
          } satisfies Column<ReconciliationRecord>,
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Reconciliation"
        description="Where our ledger and the providers' records disagree."
        actions={
          <Can I="reconciliation.run">
            <Button
              variant="outline"
              disabled={run.isPending}
              onClick={() => run.mutate(undefined)}
            >
              <Play className="size-4" />
              Run now
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
        searchPlaceholder="Reference…"
        rowKey={(row) => row.id}
        emptyTitle="Everything reconciles"
        emptyDescription="No unresolved discrepancies in this view."
        filters={
          <>
            <FilterSelect
              label="Finding"
              value={filters.status ?? ""}
              onChange={(v) => setFilter("status", v)}
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label="State"
              value={filters.resolved ?? ""}
              onChange={(v) => setFilter("resolved", v)}
              options={[
                { value: "false", label: "Unresolved" },
                { value: "true", label: "Resolved" },
              ]}
            />
          </>
        }
      />

      <AlertDialog
        open={Boolean(resolving)}
        onOpenChange={(open) => !open && setResolving(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Mark as resolved
            </AlertDialogTitle>
            <AlertDialogDescription>
              Explain what you found and what was done. This note is permanent and
              is what an auditor will read.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provider settled late; amount confirmed against their statement of 12 Aug."
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={notes.trim().length < 8 || resolve.isPending}
              onClick={() => {
                if (!resolving) return;
                resolve.mutate(
                  { id: resolving.id, notes: notes.trim() },
                  { onSuccess: () => setResolving(null) },
                );
              }}
            >
              Resolve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
