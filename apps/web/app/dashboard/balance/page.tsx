"use client";

import * as React from "react";
import { Hourglass, Landmark, Lock, Wallet } from "lucide-react";

import { Card } from "@workspace/ui/components/card";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { useLedgerEntries, useMerchantBalance } from "@/lib/api/queries";
import { formatDate, formatMoney } from "@/lib/format";
import type { LedgerEntry } from "@/lib/api/types";

const PAGE_SIZE = 25;

export default function BalancePage() {
  const balance = useMerchantBalance();
  const { page, setPage } = useTableState();
  const entries = useLedgerEntries({
    page,
    page_size: PAGE_SIZE,
    ordering: "-created_at",
  });

  const columns: Column<LedgerEntry>[] = [
    {
      id: "created",
      header: "Date",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.created_at, "time")}
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate">{row.description}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {row.reference}
          </p>
        </div>
      ),
    },
    {
      id: "account",
      header: "Account",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground">{row.account?.name ?? "—"}</span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      cell: (row) => (
        <span
          className={
            row.direction === "credit"
              ? "font-medium text-emerald-600 tabular-nums dark:text-emerald-400"
              : "font-medium tabular-nums"
          }
        >
          {row.direction === "credit" ? "+" : "−"}
          {formatMoney(row.amount, row.currency, { showCode: false })}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Balance"
        description="What you hold with XerinPay right now, and every movement behind it."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Available"
          value={formatMoney(
            balance.data?.available.amount,
            balance.data?.available.currency ?? "TZS",
          )}
          hint="Ready for the next settlement"
          icon={Wallet}
          loading={balance.isLoading}
        />
        <MetricCard
          label="Pending"
          value={formatMoney(
            balance.data?.pending.amount,
            balance.data?.pending.currency ?? "TZS",
          )}
          hint="Still clearing with providers"
          icon={Hourglass}
          loading={balance.isLoading}
        />
        <MetricCard
          label="Reserved"
          value={formatMoney(
            balance.data?.reserved.amount,
            balance.data?.reserved.currency ?? "TZS",
          )}
          hint="Held against disputes"
          icon={Lock}
          loading={balance.isLoading}
        />
        <MetricCard
          label="Settled to date"
          value={formatMoney(
            balance.data?.settled_total.amount,
            balance.data?.settled_total.currency ?? "TZS",
          )}
          hint="Paid to your bank"
          icon={Landmark}
          loading={balance.isLoading}
        />
      </div>

      <Card className="gap-0 p-5">
        <h2 className="text-base font-semibold tracking-tight">Ledger</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Double-entry record of every charge, fee, refund, and payout. This — not
          the transactions list — is what your balance is calculated from.
        </p>

        <div className="mt-5">
          <DataTable
            columns={columns}
            query={entries}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            rowKey={(row) => row.id}
            emptyTitle="No ledger entries yet"
          />
        </div>
      </Card>
    </>
  );
}
