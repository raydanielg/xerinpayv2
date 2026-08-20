"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  ShieldAlert,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import { ProviderPerformanceChart } from "@/components/charts/provider-performance";
import { VolumeChart, type Range } from "@/components/charts/volume-chart";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  useOverview,
  usePlatformAlerts,
  useProviderPerformance,
  useTransactions,
  useVolumeSeries,
} from "@/lib/api/queries";
import { Can, usePermissions } from "@/lib/rbac/use-permissions";
import { formatMoney, formatNumber, formatPercent, formatRelative } from "@/lib/format";

const SEVERITY_STYLE = {
  info: {
    icon: Info,
    className: "border-sky-500/30 bg-sky-500/5",
    iconClass: "text-sky-600 dark:text-sky-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/5",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  critical: {
    icon: ShieldAlert,
    className: "border-red-500/30 bg-red-500/5",
    iconClass: "text-red-600 dark:text-red-400",
  },
} as const;

export default function AdminDashboardPage() {
  const [range, setRange] = React.useState<Range>("30d");
  const { canAccessModule } = usePermissions();

  const overview = useOverview({ range });
  const series = useVolumeSeries({ range });
  const alerts = usePlatformAlerts();
  const providers = useProviderPerformance({ range });
  const recent = useTransactions({ page_size: 8, ordering: "-created_at" });

  const cur = overview.data?.total_processed.currency ?? "TZS";

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Volume, revenue, and anything that needs a human today."
        actions={
          <Can I="reports.export">
            <Button variant="outline" asChild>
              <Link href="/admin/reports">
                Reports
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Can>
        }
      />

      {/* Attention first: what is broken comes before what is going well. */}
      {(alerts.data?.length ?? 0) > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.data?.slice(0, 4).map((alert) => {
            const style = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.info;
            const Icon = style.icon;
            return (
              <Card
                key={alert.id}
                className={cn("flex-row items-start gap-3 p-4", style.className)}
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", style.iconClass)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelative(alert.created_at)}
                  </p>
                </div>
                {alert.href ? (
                  <Button asChild size="sm" variant="ghost" className="shrink-0">
                    <Link href={alert.href}>Review</Link>
                  </Button>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Total processed"
          value={formatMoney(overview.data?.total_processed.amount, cur)}
          delta={overview.data?.deltas?.total_processed}
          icon={TrendingUp}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Volume today"
          value={formatMoney(overview.data?.today_volume.amount, cur)}
          delta={overview.data?.deltas?.today_volume}
          icon={CreditCard}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Platform revenue"
          value={formatMoney(overview.data?.platform_revenue.amount, cur)}
          delta={overview.data?.deltas?.platform_revenue}
          icon={Banknote}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Successful payments"
          value={formatNumber(overview.data?.successful_count)}
          icon={CheckCircle2}
          loading={overview.isLoading}
          hint={formatPercent(overview.data?.success_rate) + " success rate"}
        />
        <MetricCard
          label="Failed payments"
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
          hint="Awaiting provider confirmation"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <VolumeChart
          data={series.data}
          currency={cur}
          isLoading={series.isLoading}
          error={series.error}
          range={range}
          onRangeChange={setRange}
          description="Gross volume across every merchant and provider."
        />

        {canAccessModule("providers") ? (
          <ProviderPerformanceChart
            data={providers.data}
            currency={cur}
            isLoading={providers.isLoading}
          />
        ) : null}
      </div>

      <Can I="transactions.view">
        <Card className="gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">Latest activity</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/transactions">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <ul className="divide-y divide-border/60">
            {recent.data?.results.map((txn) => (
              <li key={txn.id}>
                <Link
                  href={`/admin/transactions/${txn.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {txn.merchant?.name ?? "—"}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      {txn.reference}
                    </p>
                  </div>
                  <span className="hidden text-sm text-muted-foreground md:block">
                    {txn.provider?.name ?? "—"}
                  </span>
                  <StatusBadge status={txn.status} size="sm" />
                  <span className="w-28 text-right text-sm font-medium tabular-nums">
                    {formatMoney(txn.amount, txn.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </Can>

      <Can I="kyc.view">
        <Card className="flex-row items-center gap-4 p-5">
          <BadgeCheck className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Merchant verification queue</p>
            <p className="text-sm text-muted-foreground">
              Review submitted documents and approve merchants for live payments.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/kyc">Open queue</Link>
          </Button>
        </Card>
      </Can>
    </>
  );
}
