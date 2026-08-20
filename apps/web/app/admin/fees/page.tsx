"use client";

import * as React from "react";
import { Info, Receipt } from "lucide-react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { useFeeRules } from "@/lib/api/queries";
import { formatMoney } from "@/lib/format";
import type { FeeRule } from "@/lib/api/types";

const PAGE_SIZE = 25;

const SCOPE_LABEL: Record<string, string> = {
  merchant: "Merchant",
  payment_method: "Payment method",
  provider: "Provider",
  global: "Global",
};

/** Most specific wins — the same order the backend resolves in. */
const PRECEDENCE = ["merchant", "payment_method", "provider", "global"];

function describeFee(rule: FeeRule): string {
  const percentage = rule.percentage ? `${rule.percentage}%` : null;
  const fixed =
    rule.fixed_amount !== null && rule.fixed_amount !== undefined
      ? formatMoney(rule.fixed_amount, rule.currency)
      : null;

  if (rule.mode === "percentage") return percentage ?? "—";
  if (rule.mode === "fixed") return fixed ?? "—";
  return [percentage, fixed].filter(Boolean).join(" + ") || "—";
}

export default function FeesPage() {
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ scope: "", is_active: "" });

  const query = useFeeRules({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    scope: filters.scope || undefined,
    is_active: filters.is_active || undefined,
    ordering: "priority",
  });

  const columns: Column<FeeRule>[] = [
    {
      id: "name",
      header: "Rule",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.merchant?.name ??
              row.provider?.name ??
              (row.payment_method
                ? row.payment_method.replace(/_/g, " ")
                : "All traffic")}
          </p>
        </div>
      ),
    },
    {
      id: "scope",
      header: "Scope",
      cell: (row) => (
        <Badge variant="outline">{SCOPE_LABEL[row.scope] ?? row.scope}</Badge>
      ),
    },
    {
      id: "fee",
      header: "Fee",
      cell: (row) => <span className="font-medium tabular-nums">{describeFee(row)}</span>,
    },
    {
      id: "bearer",
      header: "Paid by",
      secondary: true,
      cell: (row) => <span className="capitalize">{row.bearer}</span>,
    },
    {
      id: "bounds",
      header: "Min / max",
      secondary: true,
      align: "right",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground tabular-nums">
          {row.min_fee !== null ? formatMoney(row.min_fee, row.currency) : "—"} /{" "}
          {row.max_fee !== null ? formatMoney(row.max_fee, row.currency) : "—"}
        </span>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      align: "right",
      secondary: true,
      cell: (row) => <span className="tabular-nums">{row.priority}</span>,
    },
    {
      id: "active",
      header: "State",
      align: "right",
      cell: (row) =>
        row.is_active ? (
          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Fees"
        description="What XerinPay charges, and who pays it."
      />

      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          <span className="font-medium">Resolution order:</span>{" "}
          {PRECEDENCE.map((scope) => SCOPE_LABEL[scope]).join(" → ")}. The first
          matching active rule wins — a merchant-specific rate overrides the
          payment-method rate, which overrides the provider rate, which overrides
          the global default.
        </AlertDescription>
      </Alert>

      <Card className="gap-0 p-5">
        <div className="flex items-center gap-3">
          <Receipt className="size-5 text-muted-foreground" />
          <div>
            <h2 className="text-base font-semibold tracking-tight">Fee rules</h2>
            <p className="text-sm text-muted-foreground">
              Changes take effect on the next transaction and are written to the
              audit log.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <DataTable
            columns={columns}
            query={query}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Rule name or merchant…"
            rowKey={(row) => row.id}
            emptyTitle="No fee rules"
            emptyDescription="Add a global rule so every transaction has a rate to fall back on."
            filters={
              <>
                <FilterSelect
                  label="Scope"
                  value={filters.scope ?? ""}
                  onChange={(v) => setFilter("scope", v)}
                  options={PRECEDENCE.map((scope) => ({
                    value: scope,
                    label: SCOPE_LABEL[scope] ?? scope,
                  }))}
                />
                <FilterSelect
                  label="State"
                  value={filters.is_active ?? ""}
                  onChange={(v) => setFilter("is_active", v)}
                  options={[
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                />
              </>
            }
          />
        </div>
      </Card>
    </>
  );
}
