"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@workspace/ui/components/badge";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMerchants } from "@/lib/api/queries";
import { formatDate } from "@/lib/format";
import type { Merchant } from "@/lib/api/types";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ACTION_REQUIRED", label: "Action required" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

export default function AdminMerchantsPage() {
  const router = useRouter();
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ status: "", mode: "" });

  const query = useMerchants({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    status: filters.status || undefined,
    mode: filters.mode || undefined,
    ordering: "-created_at",
  });

  const columns: Column<Merchant>[] = [
    {
      id: "name",
      header: "Merchant",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {row.reference}
          </p>
        </div>
      ),
    },
    {
      id: "country",
      header: "Country",
      secondary: true,
      cell: (row) => row.country ?? "—",
    },
    {
      id: "mode",
      header: "Mode",
      cell: (row) => (
        <Badge
          variant="outline"
          className={
            row.mode === "live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }
        >
          {row.mode === "live" ? "Live" : "Sandbox"}
        </Badge>
      ),
    },
    {
      id: "kyc",
      header: "KYC",
      secondary: true,
      cell: (row) => <StatusBadge status={row.kyc_status} size="sm" />,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      id: "created",
      header: "Joined",
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
        title="Merchants"
        description="Every business on the platform, with verification and live status."
      />
      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Business name, reference, or email…"
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/merchants/${row.id}`)}
        emptyTitle="No merchants found"
        filters={
          <>
            <FilterSelect
              label="Status"
              value={filters.status ?? ""}
              onChange={(v) => setFilter("status", v)}
              options={STATUS_OPTIONS}
            />
            <FilterSelect
              label="Mode"
              value={filters.mode ?? ""}
              onChange={(v) => setFilter("mode", v)}
              options={[
                { value: "live", label: "Live" },
                { value: "sandbox", label: "Sandbox" },
              ]}
            />
          </>
        }
      />
    </>
  );
}
