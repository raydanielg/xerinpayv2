"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
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
import { Textarea } from "@workspace/ui/components/textarea";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  useApproveRefund,
  useRefunds,
  useRejectRefund,
} from "@/lib/api/queries";
import { Can, usePermissions } from "@/lib/rbac/use-permissions";
import { useSession } from "@/lib/auth/session-provider";
import { formatDate, formatMoney } from "@/lib/format";
import type { Refund } from "@/lib/api/types";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "REQUESTED", label: "Requested" },
  { value: "PENDING_APPROVAL", label: "Pending approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FAILED", label: "Failed" },
];

export function RefundsTable({ scope }: { scope: "merchant" | "admin" }) {
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ status: "" });
  const { user } = useSession();
  const { has } = usePermissions();

  const query = useRefunds({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    status: filters.status || undefined,
    ordering: "-created_at",
  });

  const approve = useApproveRefund();
  const reject = useRejectRefund();
  const [rejecting, setRejecting] = React.useState<Refund | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const canDecide = has("refunds.approve") || has("refunds.reject");

  /**
   * Separation of duties: the person who raised a refund must not approve it.
   * The backend enforces this; hiding the buttons keeps the rule visible rather
   * than surfacing it as a confusing 403 after the click.
   */
  const canDecideOn = React.useCallback(
    (refund: Refund) => {
      if (!canDecide) return false;
      const pending =
        refund.status === "REQUESTED" || refund.status === "PENDING_APPROVAL";
      if (!pending) return false;
      const selfRaised =
        refund.requested_by && user
          ? refund.requested_by === user.email || refund.requested_by === user.full_name
          : false;
      return !selfRaised;
    },
    [canDecide, user],
  );

  const columns: Column<Refund>[] = [
    {
      id: "reference",
      header: "Refund",
      cell: (row) => <span className="font-mono text-xs">{row.reference}</span>,
    },
    {
      id: "transaction",
      header: "Transaction",
      secondary: true,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.transaction?.reference ?? "—"}
        </span>
      ),
    },
    ...(scope === "admin"
      ? [
          {
            id: "merchant",
            header: "Merchant",
            cell: (row: Refund) => row.merchant?.name ?? "—",
          } satisfies Column<Refund>,
        ]
      : []),
    {
      id: "reason",
      header: "Reason",
      secondary: true,
      cell: (row) => (
        <span className="block max-w-56 truncate text-muted-foreground">
          {row.reason || "—"}
        </span>
      ),
    },
    {
      id: "requested_by",
      header: "Requested by",
      secondary: true,
      cell: (row) => row.requested_by ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      cell: (row) => (
        <span className="font-medium tabular-nums">
          {formatMoney(row.amount, row.currency)}
        </span>
      ),
    },
    {
      id: "created",
      header: "Requested",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    ...(canDecide
      ? [
          {
            id: "actions",
            header: <span className="sr-only">Actions</span>,
            align: "right" as const,
            cell: (row: Refund) =>
              canDecideOn(row) ? (
                <div className="flex justify-end gap-1">
                  <Can I="refunds.approve">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      disabled={approve.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        approve.mutate(row.id);
                      }}
                    >
                      <Check className="size-4" />
                      Approve
                    </Button>
                  </Can>
                  <Can I="refunds.reject">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRejecting(row);
                        setRejectReason("");
                      }}
                    >
                      <X className="size-4" />
                      Reject
                    </Button>
                  </Can>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          } satisfies Column<Refund>,
        ]
      : []),
  ];

  return (
    <>
      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Refund or transaction reference…"
        rowKey={(row) => row.id}
        emptyTitle="No refunds"
        emptyDescription="Refund requests appear here for approval."
        filters={
          <FilterSelect
            label="Status"
            value={filters.status ?? ""}
            onChange={(v) => setFilter("status", v)}
            options={STATUS_OPTIONS}
          />
        }
      />

      <AlertDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this refund?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejecting
                ? `${rejecting.reference} · ${formatMoney(rejecting.amount, rejecting.currency)}`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why is this being rejected?"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              The reason is written to the audit log and shown to the requester.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={rejectReason.trim().length < 4 || reject.isPending}
              onClick={() => {
                if (!rejecting) return;
                reject.mutate(
                  { id: rejecting.id, reason: rejectReason.trim() },
                  { onSuccess: () => setRejecting(null) },
                );
              }}
            >
              Reject refund
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
