"use client";

import * as React from "react";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useCustomers } from "@/lib/api/queries";
import { formatDate, formatMoney, formatNumber, mask } from "@/lib/format";
import type { Customer } from "@/lib/api/types";

const PAGE_SIZE = 25;

export default function AdminCustomersPage() {
  const { page, setPage, search, setSearch, debounced } = useTableState();
  const query = useCustomers({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    ordering: "-created_at",
  });

  const columns: Column<Customer>[] = [
    {
      id: "name",
      header: "Customer",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name || "Unnamed"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.email ?? mask(row.phone, 4)}
          </p>
        </div>
      ),
    },
    {
      id: "merchant",
      header: "Merchant",
      cell: (row) => row.merchant?.name ?? "—",
    },
    {
      id: "transactions",
      header: "Payments",
      align: "right",
      cell: (row) => (
        <span className="tabular-nums">{formatNumber(row.transaction_count)}</span>
      ),
    },
    {
      id: "spent",
      header: "Total spent",
      align: "right",
      cell: (row) => (
        <span className="font-medium tabular-nums">
          {formatMoney(row.total_spent, row.currency)}
        </span>
      ),
    },
    {
      id: "created",
      header: "First seen",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="End customers across every merchant. Contact details are masked in this view."
      />
      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Name, phone, or email…"
        rowKey={(row) => row.id}
        emptyTitle="No customers found"
      />
    </>
  );
}
