"use client";

import * as React from "react";
import { BarChart3, Download, Receipt, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { VolumeChart, type Range } from "@/components/charts/volume-chart";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { endpoints } from "@/lib/api/endpoints";
import { useOverview, useVolumeSeries } from "@/lib/api/queries";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

const REPORTS: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
}[] = [
  {
    id: "transactions",
    title: "Transactions",
    description: "Every payment with method, provider, fee, and status.",
    icon: BarChart3,
    path: endpoints.reports.transactions,
  },
  {
    id: "fees",
    title: "Fees",
    description: "What you were charged, per transaction and in total.",
    icon: Receipt,
    path: endpoints.reports.fees,
  },
  {
    id: "settlements",
    title: "Settlements",
    description: "Payouts to your bank with the transactions behind each one.",
    icon: Wallet,
    path: endpoints.reports.settlements,
  },
];

export default function MerchantReportsPage() {
  const [range, setRange] = React.useState<Range>("30d");
  const [format, setFormat] = React.useState("csv");

  const overview = useOverview({ range });
  const series = useVolumeSeries({ range });
  const cur = overview.data?.total_processed.currency ?? "TZS";

  return (
    <>
      <PageHeader
        title="Reports"
        description="Your numbers, and exports your accountant can work from."
        actions={
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger size="sm" className="w-32" aria-label="Export format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Volume"
          value={formatMoney(overview.data?.total_processed.amount, cur)}
          delta={overview.data?.deltas?.total_processed}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Fees paid"
          value={formatMoney(overview.data?.platform_revenue.amount, cur)}
          positiveIsGood={false}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Successful"
          value={formatNumber(overview.data?.successful_count)}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Success rate"
          value={formatPercent(overview.data?.success_rate)}
          delta={overview.data?.deltas?.success_rate}
          loading={overview.isLoading}
        />
      </div>

      <VolumeChart
        data={series.data}
        currency={cur}
        isLoading={series.isLoading}
        error={series.error}
        range={range}
        onRangeChange={setRange}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {REPORTS.map((report) => (
          <Card key={report.id} className="gap-0 p-5">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-muted">
              <report.icon className="size-5 text-muted-foreground" />
            </span>
            <h3 className="mt-4 text-sm font-semibold">{report.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-fit"
              onClick={() =>
                window.open(
                  `/api/proxy${report.path}?${new URLSearchParams({ range, format })}`,
                  "_blank",
                )
              }
            >
              <Download className="size-4" />
              Export {format.toUpperCase()}
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
