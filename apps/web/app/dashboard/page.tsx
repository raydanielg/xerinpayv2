"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Hourglass,
  Wallet,
  XCircle,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

import { VolumeChart, type Range } from "@/components/charts/volume-chart";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import {
  useMerchantBalance,
  useOverview,
  useTransactions,
  useVolumeSeries,
} from "@/lib/api/queries";
import { useSession } from "@/lib/auth/session-provider";
import { formatDate, formatMoney, formatNumber, formatPercent } from "@/lib/format";

export default function MerchantDashboardPage() {
  const { user } = useSession();
  const [range, setRange] = React.useState<Range>("30d");

  const overview = useOverview({ range });
  const series = useVolumeSeries({ range });
  const balance = useMerchantBalance();
  const recent = useTransactions({ page_size: 6, ordering: "-created_at" });

  const cur = overview.data?.today_volume.currency ?? "TZS";

  const kycPending =
    user?.merchant?.status && user.merchant.status !== "APPROVED";

  const firstName = user?.first_name || "there";

  return (
    <>
      <PageHeader
        title={`Good to see you, ${firstName}`}
        description="Here's how your account is doing."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/dashboard/payment-links">Create payment link</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/developers/keys">
                API keys
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        }
      />

      {kycPending ? (
        <Alert>
          <BadgeCheck className="size-4" />
          <AlertTitle>Finish verification to go live</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>
              Your account is in sandbox. Submit your business documents to start
              accepting real payments.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/settings/business">Continue verification</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Balance */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Available balance"
          value={formatMoney(balance.data?.available.amount, balance.data?.available.currency ?? cur)}
          hint="Ready to settle"
          icon={Wallet}
          loading={balance.isLoading}
        />
        <MetricCard
          label="Pending balance"
          value={formatMoney(balance.data?.pending.amount, balance.data?.pending.currency ?? cur)}
          hint="Clearing with providers"
          icon={Hourglass}
          loading={balance.isLoading}
        />
        <MetricCard
          label="Volume today"
          value={formatMoney(overview.data?.today_volume.amount, cur)}
          delta={overview.data?.deltas?.today_volume}
          icon={CreditCard}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Success rate"
          value={formatPercent(overview.data?.success_rate)}
          delta={overview.data?.deltas?.success_rate}
          icon={CheckCircle2}
          loading={overview.isLoading}
        />
      </div>

      {/* Chart + counts */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <VolumeChart
          data={series.data}
          currency={cur}
          isLoading={series.isLoading}
          error={series.error}
          range={range}
          onRangeChange={setRange}
          description="Successful payments, settled and pending."
        />

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <MetricCard
            label="Successful"
            value={formatNumber(overview.data?.successful_count)}
            icon={CheckCircle2}
            loading={overview.isLoading}
            hint="In selected period"
          />
          <MetricCard
            label="Failed"
            value={formatNumber(overview.data?.failed_count)}
            delta={overview.data?.deltas?.failed_count}
            positiveIsGood={false}
            icon={XCircle}
            loading={overview.isLoading}
          />
          <MetricCard
            label="Pending"
            value={formatNumber(overview.data?.pending_count)}
            icon={Clock}
            loading={overview.isLoading}
            hint="Awaiting confirmation"
          />
        </div>
      </div>

      {/* Recent activity */}
      <Card className="gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight">Recent transactions</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/transactions">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {recent.isLoading ? (
          <div className="divide-y divide-border/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : (recent.data?.results.length ?? 0) === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Your first payment will appear here the moment it comes in."
            className="border-0"
            action={
              <Button asChild size="sm">
                <Link href="/dashboard/developers/keys">Get your API keys</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.data?.results.map((txn) => (
              <li key={txn.id}>
                <Link
                  href={`/dashboard/transactions/${txn.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {txn.reference}
                    </p>
                    <p className="mt-0.5 truncate text-sm">
                      {txn.customer?.name ?? txn.customer?.phone ?? "—"}
                    </p>
                  </div>
                  <span className="hidden text-sm text-muted-foreground sm:block">
                    {txn.provider?.name ?? "—"}
                  </span>
                  <StatusBadge status={txn.status} size="sm" />
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {formatMoney(txn.amount, txn.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(txn.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
