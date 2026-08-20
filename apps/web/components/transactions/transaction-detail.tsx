"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Copy, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

import { RefundDialog } from "@/components/transactions/refund-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/states";
import {
  useRetryPayment,
  useTransaction,
  useTransactionAttempts,
} from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
import { formatDate, formatMoney } from "@/lib/format";

function CopyValue({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Could not copy");
        }
      }}
      className={cn(
        "group inline-flex items-center gap-1.5 font-mono text-sm hover:text-foreground",
        className,
      )}
    >
      {value}
      {copied ? (
        <Check className="size-3.5 text-emerald-500" />
      ) : (
        <Copy className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
      )}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm">{children}</dd>
    </div>
  );
}

export function TransactionDetail({
  id,
  scope,
}: {
  id: string;
  scope: "merchant" | "admin";
}) {
  const { data, isLoading, error, refetch } = useTransaction(id);
  const attempts = useTransactionAttempts(id);
  const retry = useRetryPayment();
  const [refundOpen, setRefundOpen] = React.useState(false);

  const backHref = scope === "admin" ? "/admin/transactions" : "/dashboard/transactions";

  if (error) {
    return <ErrorState status={error.status} message={error.detail} onRetry={refetch} />;
  }

  const refundable =
    data?.status === "SUCCESS" || data?.status === "PARTIALLY_REFUNDED";
  const retryable = data?.status === "FAILED" || data?.status === "EXPIRED";

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={backHref}>
          <ArrowLeft className="size-4" />
          Back to transactions
        </Link>
      </Button>

      <PageHeader
        title={isLoading ? "Loading…" : (data?.reference ?? "Transaction")}
        description={
          data ? `Created ${formatDate(data.created_at, "time")}` : undefined
        }
        actions={
          data ? (
            <>
              {retryable ? (
                <Can I="payments.retry">
                  <Button
                    variant="outline"
                    onClick={() => retry.mutate(data.id)}
                    disabled={retry.isPending}
                  >
                    <RotateCcw className="size-4" />
                    Retry payment
                  </Button>
                </Can>
              ) : null}
              {refundable ? (
                <Can I="payments.refund">
                  <Button onClick={() => setRefundOpen(true)}>Issue refund</Button>
                </Can>
              ) : null}
            </>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Summary */}
        <Card className="gap-0 p-5">
          {isLoading || !data ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-3xl font-semibold tracking-tight tabular-nums">
                  {formatMoney(data.amount, data.currency)}
                </p>
                <StatusBadge status={data.status} />
              </div>

              <Separator className="my-4" />

              <dl className="divide-y divide-border/50">
                <Field label="Reference">
                  <CopyValue value={data.reference} />
                </Field>
                <Field label="Payment method">
                  <span className="capitalize">
                    {data.payment_method?.replace(/_/g, " ") ?? "—"}
                  </span>
                </Field>
                <Field label="Provider">{data.provider?.name ?? "—"}</Field>
                {scope === "admin" ? (
                  <Field label="Merchant">{data.merchant?.name ?? "—"}</Field>
                ) : null}
                <Field label="Customer">
                  {data.customer?.name ?? data.customer?.phone ?? "—"}
                </Field>
                <Field label="Fee">
                  <span className="tabular-nums">
                    {formatMoney(data.fee, data.currency)}
                  </span>
                </Field>
                <Field label="Net to you">
                  <span className="font-medium tabular-nums">
                    {formatMoney(data.net_amount, data.currency)}
                  </span>
                </Field>
                <Field label="Description">{data.description || "—"}</Field>
                <Field label="Completed">
                  {data.completed_at ? formatDate(data.completed_at, "time") : "—"}
                </Field>
              </dl>

              {Object.keys(data.metadata ?? {}).length > 0 ? (
                <>
                  <Separator className="my-4" />
                  <p className="mb-2 text-sm font-medium">Metadata</p>
                  <pre className="overflow-auto rounded-lg bg-muted/60 p-3 text-xs">
                    {JSON.stringify(data.metadata, null, 2)}
                  </pre>
                </>
              ) : null}
            </>
          )}
        </Card>

        {/* Attempt timeline — the fallback story, in order */}
        <Card className="gap-0 p-5">
          <h2 className="text-base font-semibold tracking-tight">Payment attempts</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Each attempt is one provider. A failure here rolls to the next in the
            routing rule.
          </p>

          <div className="mt-5">
            {attempts.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (attempts.data?.results.length ?? 0) === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No attempts recorded.
              </p>
            ) : (
              <ol className="relative space-y-5 border-l border-border pl-6">
                {attempts.data?.results.map((attempt) => (
                  <li key={attempt.id} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-background",
                        attempt.status === "SUCCESS"
                          ? "bg-emerald-500"
                          : attempt.status === "FAILED"
                            ? "bg-red-500"
                            : "bg-muted-foreground",
                      )}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        #{attempt.sequence} · {attempt.provider.name}
                      </p>
                      <StatusBadge status={attempt.status} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(attempt.created_at, "time")}
                      {attempt.latency_ms !== null
                        ? ` · ${attempt.latency_ms}ms`
                        : ""}
                    </p>
                    {attempt.provider_reference ? (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {attempt.provider_reference}
                      </p>
                    ) : null}
                    {attempt.error_message ? (
                      <p className="mt-1.5 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                        {attempt.error_code ? `${attempt.error_code}: ` : ""}
                        {attempt.error_message}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Card>
      </div>

      {data ? (
        <RefundDialog
          open={refundOpen}
          onOpenChange={setRefundOpen}
          transaction={data}
        />
      ) : null}
    </>
  );
}
