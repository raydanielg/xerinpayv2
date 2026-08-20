"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import {
  FilterSelect,
  METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/components/shared/filter-select";
import { StatusBadge } from "@/components/shared/status-badge";
import { useTransactions } from "@/lib/api/queries";
import { endpoints } from "@/lib/api/endpoints";
import { formatDate, formatMoney } from "@/lib/format";
import type { Transaction } from "@/lib/api/types";

const PAGE_SIZE = 25;

/**
 * Shared between the merchant and admin portals. The admin variant adds a
 * merchant column and links into the admin detail route — everything else,
 * including filters and export, is identical.
 */
export function TransactionsTable({ scope }: { scope: "merchant" | "admin" }) {
  const router = useRouter();
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ status: "", payment_method: "" });

  const query = useTransactions({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    status: filters.status || undefined,
    payment_method: filters.payment_method || undefined,
    ordering: "-created_at",
  });

  const base = scope === "admin" ? "/admin/transactions" : "/dashboard/transactions";

  const columns: Column<Transaction>[] = [
    {
      id: "reference",
      header: "Reference",
      cell: (row) => (
        <span className="font-mono text-xs">{row.reference}</span>
      ),
    },
    ...(scope === "admin"
      ? [
          {
            id: "merchant",
            header: "Merchant",
            cell: (row: Transaction) => (
              <span className="max-w-40 truncate">{row.merchant?.name ?? "—"}</span>
            ),
          } satisfies Column<Transaction>,
        ]
      : []),
    {
      id: "customer",
      header: "Customer",
      secondary: true,
      cell: (row) => row.customer?.name ?? row.customer?.phone ?? "—",
    },
    {
      id: "method",
      header: "Method",
      secondary: true,
      cell: (row) => (
        <span className="capitalize">{row.payment_method?.replace(/_/g, " ") ?? "—"}</span>
      ),
    },
    {
      id: "provider",
      header: "Provider",
      secondary: true,
      cell: (row) => row.provider?.name ?? "—",
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
      id: "fee",
      header: "Fee",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground tabular-nums">
          {formatMoney(row.fee, row.currency)}
        </span>
      ),
    },
    {
      id: "created",
      header: "Date",
      align: "right",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.created_at, "time")}
        </span>
      ),
    },
  ];

  const onExport = React.useCallback(() => {
    const params = new URLSearchParams();
    if (debounced) params.set("search", debounced);
    if (filters.status) params.set("status", filters.status);
    if (filters.payment_method) params.set("payment_method", filters.payment_method);
    // Streams straight from the API through the proxy, so the export carries
    // the caller's own permissions rather than a shared service account.
    window.open(`/api/proxy${endpoints.transactions.export}?${params}`, "_blank");
  }, [debounced, filters]);

  return (
    <DataTable
      columns={columns}
      query={query}
      page={page}
      onPageChange={setPage}
      pageSize={PAGE_SIZE}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Reference, phone, or customer…"
      onExport={onExport}
      rowKey={(row) => row.id}
      onRowClick={(row) => router.push(`${base}/${row.id}`)}
      emptyTitle="No transactions found"
      emptyDescription="Try widening the date range or clearing filters."
      filters={
        <>
          <FilterSelect
            label="Status"
            value={filters.status ?? ""}
            onChange={(v) => setFilter("status", v)}
            options={PAYMENT_STATUS_OPTIONS}
          />
          <FilterSelect
            label="Method"
            value={filters.payment_method ?? ""}
            onChange={(v) => setFilter("payment_method", v)}
            options={METHOD_OPTIONS}
          />
        </>
      }
    />
  );
}
