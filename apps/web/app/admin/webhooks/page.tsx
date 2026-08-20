"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useRetryDelivery, useWebhookDeliveries } from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
import { formatDate } from "@/lib/format";
import type { WebhookDelivery } from "@/lib/api/types";

const PAGE_SIZE = 50;

export default function AdminWebhooksPage() {
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ status: "failed" });
  const retry = useRetryDelivery();
  const [selected, setSelected] = React.useState<WebhookDelivery | null>(null);

  const query = useWebhookDeliveries({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    status: filters.status || undefined,
    ordering: "-created_at",
  });

  const columns: Column<WebhookDelivery>[] = [
    {
      id: "event",
      header: "Event",
      cell: (row) => <span className="font-mono text-xs">{row.event}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      id: "http",
      header: "HTTP",
      secondary: true,
      cell: (row) => <span className="tabular-nums">{row.http_status ?? "—"}</span>,
    },
    {
      id: "attempts",
      header: "Attempts",
      align: "right",
      cell: (row) => <span className="tabular-nums">{row.attempts}</span>,
    },
    {
      id: "error",
      header: "Error",
      secondary: true,
      cell: (row) => (
        <span className="block max-w-56 truncate text-muted-foreground">
          {row.error ?? "—"}
        </span>
      ),
    },
    {
      id: "last",
      header: "Last attempt",
      align: "right",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.last_attempt_at ?? row.created_at, "time")}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (row) =>
        row.status === "failed" ? (
          <Can I="webhooks.retry">
            <Button
              size="sm"
              variant="ghost"
              disabled={retry.isPending}
              onClick={(e) => {
                e.stopPropagation();
                retry.mutate(row.id);
              }}
            >
              <RotateCcw className="size-4" />
              Retry
            </Button>
          </Can>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Webhook deliveries"
        description="Outbound events to merchant endpoints. Failures default to the top of this list."
      />

      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Event or endpoint…"
        rowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyTitle="Nothing to see"
        emptyDescription="No deliveries match this filter."
        filters={
          <FilterSelect
            label="Status"
            value={filters.status ?? ""}
            onChange={(v) => setFilter("status", v)}
            options={[
              { value: "failed", label: "Failed" },
              { value: "retrying", label: "Retrying" },
              { value: "pending", label: "Pending" },
              { value: "delivered", label: "Delivered" },
            ]}
          />
        }
      />

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-mono text-sm">{selected?.event}</SheetTitle>
            <SheetDescription>
              {selected ? formatDate(selected.created_at, "time") : ""}
            </SheetDescription>
          </SheetHeader>

          {selected ? (
            <div className="space-y-4 px-4 pb-6">
              {selected.error ? (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {selected.error}
                </div>
              ) : null}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Payload
                </p>
                <pre className="max-h-96 overflow-auto rounded-lg bg-muted/60 p-3 text-xs">
                  {JSON.stringify(selected.payload, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
