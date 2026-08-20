"use client";

import * as React from "react";
import {
  BarChart3,
  Blocks,
  Download,
  Receipt,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { ProviderPerformanceChart } from "@/components/charts/provider-performance";
import { VolumeChart, type Range } from "@/components/charts/volume-chart";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { endpoints } from "@/lib/api/endpoints";
import { useOverview, useProviderPerformance, useVolumeSeries } from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
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
    title: "Transaction report",
    description: "Every payment with merchant, provider, fee, and status.",
    icon: BarChart3,
    path: endpoints.reports.transactions,
  },
  {
    id: "revenue",
    title: "Revenue report",
    description: "Gross volume, fees earned, refunds, and net revenue.",
    icon: TrendingUp,
    path: endpoints.reports.revenue,
  },
  {
    id: "fees",
    title: "Fee report",
    description: "What was charged, under which rule, and who bore it.",
    icon: Receipt,
    path: endpoints.reports.fees,
  },
  {
    id: "settlements",
    title: "Settlement report",
    description: "Payout batches with gross, fees, refunds, and net.",
    icon: Wallet,
    path: endpoints.reports.settlements,
  },
  {
    id: "providers",
    title: "Provider report",
    description: "Volume, success rate, and failures per provider.",
    icon: Blocks,
    path: endpoints.reports.providers,
  },
  {
    id: "merchants",
    title: "Merchant report",
    description: "Top merchants by volume, revenue, and refund rate.",
    icon: Store,
    path: endpoints.reports.merchants,
  },
];

export default function ReportsPage() {
  const [range, setRange] = React.useState<Range>("30d");
  const [format, setFormat] = React.useState("csv");

  const overview = useOverview({ range });
  const series = useVolumeSeries({ range });
  const providers = useProviderPerformance({ range });

  const cur = overview.data?.total_processed.currency ?? "TZS";

  function download(path: string, id: string) {
    const params = new URLSearchParams({ range, format });
    window.open(`/api/proxy${path}?${params}`, "_blank");
    toast.success(`Generating ${id} report…`);
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="Summaries you can read here, and exports your finance team can work from."
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
          label="Gross volume"
          value={formatMoney(overview.data?.total_processed.amount, cur)}
          delta={overview.data?.deltas?.total_processed}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Platform revenue"
          value={formatMoney(overview.data?.platform_revenue.amount, cur)}
          delta={overview.data?.deltas?.platform_revenue}
          loading={overview.isLoading}
        />
        <MetricCard
          label="Successful payments"
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

      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <VolumeChart
          data={series.data}
          currency={cur}
          isLoading={series.isLoading}
          error={series.error}
          range={range}
          onRangeChange={setRange}
        />
        <ProviderPerformanceChart
          data={providers.data}
          currency={cur}
          isLoading={providers.isLoading}
        />
      </div>

      <div>
        <h2 className="text-base font-semibold tracking-tight">Export a report</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Exports run with your own permissions — you only ever receive rows you
          are allowed to see.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REPORTS.map((report) => (
            <Card key={report.id} className="gap-0 p-5">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-muted">
                <report.icon className="size-5 text-muted-foreground" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{report.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
              <Can I="reports.export">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-fit"
                  onClick={() => download(report.path, report.title)}
                >
                  <Download className="size-4" />
                  Export {format.toUpperCase()}
                </Button>
              </Can>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
