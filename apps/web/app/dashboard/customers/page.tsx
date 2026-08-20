"use client";

import * as React from "react";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useCustomers } from "@/lib/api/queries";
import { formatDate, formatMoney, formatNumber, mask } from "@/lib/format";
import type { Customer } from "@/lib/api/types";

const PAGE_SIZE = 25;

export default function CustomersPage() {
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
            {/* Phone numbers are masked in list views; the full value lives on
                the detail page, where opening it is an auditable action. */}
            {row.email ?? mask(row.phone, 4)}
          </p>
        </div>
      ),
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
        description="People who have paid you, grouped by phone number or email."
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
        emptyTitle="No customers yet"
        emptyDescription="A customer record is created the first time someone pays you."
      />
    </>
  );
}
