"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApproveSettlement, useSettlements } from "@/lib/api/queries";
import { Can, usePermissions } from "@/lib/rbac/use-permissions";
import { endpoints } from "@/lib/api/endpoints";
import { formatDate, formatMoney } from "@/lib/format";
import type { Settlement } from "@/lib/api/types";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REVERSED", label: "Reversed" },
];

export function SettlementsTable({ scope }: { scope: "merchant" | "admin" }) {
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ status: "" });
  const { has } = usePermissions();
  const approve = useApproveSettlement();

  const query = useSettlements({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    status: filters.status || undefined,
    ordering: "-created_at",
  });

  const canApprove = scope === "admin" && has("settlements.approve");

  const columns: Column<Settlement>[] = [
    {
      id: "reference",
      header: "Settlement",
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-mono text-xs">{row.reference}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(row.period_start)} – {formatDate(row.period_end)}
          </p>
        </div>
      ),
    },
    ...(scope === "admin"
      ? [
          {
            id: "merchant",
            header: "Merchant",
            cell: (row: Settlement) => row.merchant?.name ?? "—",
          } satisfies Column<Settlement>,
        ]
      : []),
    {
      id: "items",
      header: "Items",
      align: "right",
      secondary: true,
      cell: (row) => <span className="tabular-nums">{row.items_count}</span>,
    },
    {
      id: "gross",
      header: "Gross",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="tabular-nums">{formatMoney(row.gross_amount, row.currency)}</span>
      ),
    },
    {
      id: "fees",
      header: "Fees",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground tabular-nums">
          −{formatMoney(row.fee_amount, row.currency, { showCode: false })}
        </span>
      ),
    },
    {
      id: "refunds",
      header: "Refunds",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground tabular-nums">
          −{formatMoney(row.refund_amount, row.currency, { showCode: false })}
        </span>
      ),
    },
    {
      id: "net",
      header: "Net payout",
      align: "right",
      cell: (row) => (
        <span className="font-medium tabular-nums">
          {formatMoney(row.net_amount, row.currency)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      align: "right",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    ...(canApprove
      ? [
          {
            id: "actions",
            header: <span className="sr-only">Actions</span>,
            align: "right" as const,
            cell: (row: Settlement) =>
              row.status === "PENDING" ? (
                <Can I="settlements.approve">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-emerald-600 dark:text-emerald-400"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate(row.id)}
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>
                </Can>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {row.approved_by ?? "—"}
                </span>
              ),
          } satisfies Column<Settlement>,
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      query={query}
      page={page}
      onPageChange={setPage}
      pageSize={PAGE_SIZE}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Settlement reference…"
      onExport={() => window.open(`/api/proxy${endpoints.settlements.export}`, "_blank")}
      rowKey={(row) => row.id}
      emptyTitle="No settlements yet"
      emptyDescription="Settlements appear once transactions clear and a payout batch is created."
      filters={
        <FilterSelect
          label="Status"
          value={filters.status ?? ""}
          onChange={(v) => setFilter("status", v)}
          options={STATUS_OPTIONS}
        />
      }
    />
  );
}
