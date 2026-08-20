"use client";

import * as React from "react";
import { FileSearch, ShieldCheck } from "lucide-react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
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
import { useAuditLogs } from "@/lib/api/queries";
import { endpoints } from "@/lib/api/endpoints";
import { MODULE_LABELS } from "@/lib/rbac/permissions";
import { formatDate } from "@/lib/format";
import type { AuditLog } from "@/lib/api/types";

const PAGE_SIZE = 50;

function DiffBlock({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown> | null;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{title}</p>
      <pre className="max-h-64 overflow-auto rounded-lg bg-muted/60 p-3 text-xs">
        {value ? JSON.stringify(value, null, 2) : "—"}
      </pre>
    </div>
  );
}

export default function AuditLogPage() {
  const { page, setPage, search, setSearch, debounced, filters, setFilter } =
    useTableState({ module: "", action: "" });
  const [selected, setSelected] = React.useState<AuditLog | null>(null);

  const query = useAuditLogs({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    module: filters.module || undefined,
    action: filters.action || undefined,
    ordering: "-created_at",
  });

  const columns: Column<AuditLog>[] = [
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
      id: "actor",
      header: "Who",
      cell: (row) => <span className="font-medium">{row.actor}</span>,
    },
    {
      id: "action",
      header: "Action",
      cell: (row) => (
        <span className="font-mono text-xs">{row.action}</span>
      ),
    },
    {
      id: "module",
      header: "Module",
      secondary: true,
      cell: (row) => <Badge variant="outline">{row.module}</Badge>,
    },
    {
      id: "object",
      header: "Object",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.object_type ? `${row.object_type} ${row.object_id ?? ""}` : "—"}
        </span>
      ),
    },
    {
      id: "ip",
      header: "IP",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.ip_address ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="Every privileged action, with what changed and who changed it."
      />

      <Alert>
        <ShieldCheck className="size-4" />
        <AlertDescription>
          This log is append-only. Nobody — including a Super Admin — can edit or
          delete an entry from the dashboard. Export it to your SIEM if you need
          long-term retention outside the platform.
        </AlertDescription>
      </Alert>

      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Actor, action, or object…"
        onExport={() => window.open(`/api/proxy${endpoints.audit.export}`, "_blank")}
        rowKey={(row) => row.id}
        onRowClick={setSelected}
        emptyTitle="No matching activity"
        filters={
          <FilterSelect
            label="Module"
            value={filters.module ?? ""}
            onChange={(v) => setFilter("module", v)}
            options={Object.entries(MODULE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        }
      />

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileSearch className="size-4" />
              {selected?.action}
            </SheetTitle>
            <SheetDescription>
              {selected ? formatDate(selected.created_at, "time") : ""}
            </SheetDescription>
          </SheetHeader>

          {selected ? (
            <div className="space-y-5 px-4 pb-6">
              <dl className="divide-y divide-border/50 rounded-lg border border-border/60 px-3">
                {[
                  ["Actor", selected.actor],
                  ["Module", selected.module],
                  ["Object", selected.object_type ?? "—"],
                  ["Object ID", selected.object_id ?? "—"],
                  ["IP address", selected.ip_address ?? "—"],
                  ["User agent", selected.user_agent ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-4 py-2.5 text-sm">
                    <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 flex-1 break-words">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid gap-4 sm:grid-cols-2">
                <DiffBlock title="Before" value={selected.old_value} />
                <DiffBlock title="After" value={selected.new_value} />
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
