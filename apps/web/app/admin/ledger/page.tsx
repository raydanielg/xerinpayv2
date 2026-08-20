"use client";

import * as React from "react";
import { Scale } from "lucide-react";

import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useLedgerAccounts, useLedgerEntries } from "@/lib/api/queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { LedgerEntry } from "@/lib/api/types";

const PAGE_SIZE = 50;

const TYPE_LABEL: Record<string, string> = {
  asset: "Asset",
  liability: "Liability",
  revenue: "Revenue",
  expense: "Expense",
  equity: "Equity",
};

export default function LedgerPage() {
  const accounts = useLedgerAccounts();
  const { page, setPage, search, setSearch, debounced } = useTableState();
  const entries = useLedgerEntries({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    ordering: "-created_at",
  });

  const columns: Column<LedgerEntry>[] = [
    {
      id: "created",
      header: "When",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.created_at, "time")}
        </span>
      ),
    },
    {
      id: "account",
      header: "Account",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.account?.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {row.account?.code}
          </p>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      secondary: true,
      cell: (row) => (
        <span className="block max-w-64 truncate text-muted-foreground">
          {row.description}
        </span>
      ),
    },
    {
      id: "reference",
      header: "Reference",
      secondary: true,
      cell: (row) => <span className="font-mono text-xs">{row.reference}</span>,
    },
    {
      id: "debit",
      header: "Debit",
      align: "right",
      cell: (row) =>
        row.direction === "debit" ? (
          <span className="font-medium tabular-nums">
            {formatMoney(row.amount, row.currency, { showCode: false })}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "credit",
      header: "Credit",
      align: "right",
      cell: (row) =>
        row.direction === "credit" ? (
          <span className="font-medium tabular-nums">
            {formatMoney(row.amount, row.currency, { showCode: false })}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Ledger"
        description="Double-entry record behind every balance, settlement, and report."
      />

      {/* Accounts */}
      {accounts.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {accounts.data?.results.map((account) => (
            <Card key={account.id} className="gap-0 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{account.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {account.code}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {TYPE_LABEL[account.type] ?? account.type}
                </span>
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums">
                {formatMoney(account.balance, account.currency)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card className="gap-0 p-5">
        <div className="flex items-center gap-3">
          <Scale className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-base font-semibold tracking-tight">Journal entries</h2>
            <p className="text-sm text-muted-foreground">
              Every entry is immutable. Corrections are made by posting a reversing
              entry, never by editing history.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <DataTable
            columns={columns}
            query={entries}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Reference or description…"
            rowKey={(row) => row.id}
            emptyTitle="No entries"
          />
        </div>
      </Card>
    </>
  );
}
