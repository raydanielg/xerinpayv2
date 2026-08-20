"use client";

import * as React from "react";
import { Plus, RotateCcw, Webhook } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import {
  useRetryDelivery,
  useSaveWebhookEndpoint,
  useWebhookDeliveries,
  useWebhookEndpoints,
} from "@/lib/api/queries";
import { formatDate, formatPercent } from "@/lib/format";
import type { WebhookDelivery } from "@/lib/api/types";

const PAGE_SIZE = 25;

const EVENTS = [
  "payment.created",
  "payment.pending",
  "payment.success",
  "payment.failed",
  "payment.refunded",
  "settlement.completed",
];

export default function WebhooksPage() {
  const endpointsQuery = useWebhookEndpoints();
  const saveEndpoint = useSaveWebhookEndpoint();
  const retry = useRetryDelivery();

  const { page, setPage, filters, setFilter } = useTableState({ status: "" });
  const deliveries = useWebhookDeliveries({
    page,
    page_size: PAGE_SIZE,
    status: filters.status || undefined,
    ordering: "-created_at",
  });

  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [events, setEvents] = React.useState<string[]>(EVENTS);

  const endpoints = endpointsQuery.data?.results ?? [];

  const httpsOnly = url.startsWith("https://");
  const canSave = httpsOnly && events.length > 0;

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
      cell: (row) => (
        <span className="tabular-nums">{row.http_status ?? "—"}</span>
      ),
    },
    {
      id: "attempts",
      header: "Attempts",
      align: "right",
      secondary: true,
      cell: (row) => <span className="tabular-nums">{row.attempts}</span>,
    },
    {
      id: "latency",
      header: "Response",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">
          {row.response_time_ms !== null ? `${row.response_time_ms}ms` : "—"}
        </span>
      ),
    },
    {
      id: "created",
      header: "Sent",
      align: "right",
      cell: (row) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(row.created_at, "time")}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (row) =>
        row.status === "failed" ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={retry.isPending}
            onClick={() => retry.mutate(row.id)}
          >
            <RotateCcw className="size-4" />
            Retry
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="We notify your server when a payment changes state. Signed, idempotent, and retried for 72 hours."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Add endpoint
          </Button>
        }
      />

      {/* Endpoints */}
      {endpointsQuery.isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : endpoints.length === 0 ? (
        <EmptyState
          icon={Webhook}
          title="No endpoints yet"
          description="Add an HTTPS URL and we'll POST every event to it."
          action={<Button onClick={() => setOpen(true)}>Add endpoint</Button>}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className="gap-0 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 break-all font-mono text-sm">
                  {endpoint.url}
                </p>
                <Badge variant={endpoint.is_active ? "secondary" : "outline"}>
                  {endpoint.is_active ? "Active" : "Paused"}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {endpoint.events?.slice(0, 6).map((event) => (
                  <span
                    key={event}
                    className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {event}
                  </span>
                ))}
              </div>

              <dl className="mt-4 flex items-center justify-between gap-4 border-t border-border/60 pt-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Signing secret</dt>
                  <dd className="mt-0.5 font-mono text-xs">{endpoint.secret_preview}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-xs text-muted-foreground">Delivery rate</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {formatPercent(endpoint.success_rate)}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      {/* Deliveries */}
      <Card className="gap-0 p-5">
        <h2 className="text-base font-semibold tracking-tight">Recent deliveries</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Every attempt, with the response we got back. Failed deliveries can be
          replayed at any time.
        </p>

        <div className="mt-5">
          <DataTable
            columns={columns}
            query={deliveries}
            page={page}
            onPageChange={setPage}
            pageSize={PAGE_SIZE}
            rowKey={(row) => row.id}
            emptyTitle="No deliveries yet"
            filters={
              <FilterSelect
                label="Status"
                value={filters.status ?? ""}
                onChange={(v) => setFilter("status", v)}
                options={[
                  { value: "delivered", label: "Delivered" },
                  { value: "failed", label: "Failed" },
                  { value: "retrying", label: "Retrying" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            }
          />
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add webhook endpoint</DialogTitle>
            <DialogDescription>
              We&apos;ll sign every request with HMAC-SHA256 — verify the signature
              before trusting the payload.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.yourshop.co.tz/webhooks/xerinpay"
              />
              {url && !httpsOnly ? (
                <p className="text-xs text-destructive">
                  HTTPS is required. Plain HTTP would expose payment data in transit.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {EVENTS.map((event) => (
                  <div key={event} className="flex items-center gap-2">
                    <Checkbox
                      id={event}
                      checked={events.includes(event)}
                      onCheckedChange={(checked) =>
                        setEvents((prev) =>
                          checked === true
                            ? [...prev, event]
                            : prev.filter((e) => e !== event),
                        )
                      }
                    />
                    <Label htmlFor={event} className="font-mono text-xs font-normal">
                      {event}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSave || saveEndpoint.isPending}
              onClick={() =>
                saveEndpoint.mutate(
                  { data: { url, events, is_active: true } },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setUrl("");
                    },
                  },
                )
              }
            >
              Add endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
