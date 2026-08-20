"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card } from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { EmptyState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import type { Currency, ProviderPerformance } from "@/lib/api/types";

/**
 * Provider share of volume.
 *
 * Horizontal bars: the provider name is the y-axis label, so identity comes
 * from position, not colour, and no legend box is needed. Colour is assigned in
 * fixed catalogue order — filtering providers out never repaints the survivors.
 */

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const config = {
  volume: { label: "Volume" },
} satisfies ChartConfig;

export function ProviderPerformanceChart({
  data,
  currency = "TZS",
  isLoading,
}: {
  data?: ProviderPerformance[];
  currency?: Currency;
  isLoading?: boolean;
}) {
  const rows = React.useMemo(
    () =>
      (data ?? [])
        .slice()
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 8)
        .map((item, index) => ({
          name: item.provider.name,
          volume: item.volume,
          count: item.count,
          successRate: item.success_rate,
          fill: SERIES_COLORS[index % SERIES_COLORS.length],
        })),
    [data],
  );

  return (
    <Card className="gap-0 p-5">
      <h2 className="text-base font-semibold tracking-tight">Provider performance</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Volume routed per provider, with authorisation rate.
      </p>

      <div className="mt-5">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No provider activity yet"
            className="h-[220px] py-0"
          />
        ) : (
          <>
            <ChartContainer config={config} className="h-[220px] w-full">
              <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tickFormatter={(value: number) =>
                    formatMoney(value, currency, { compact: true, showCode: false })
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={92}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={{ className: "fill-muted/40" }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatMoney(Number(value), currency)}
                    />
                  }
                />
                <Bar dataKey="volume" radius={4} barSize={18} />
              </BarChart>
            </ChartContainer>

            {/* Table view — identity and value without relying on the chart. */}
            <ul className="mt-4 space-y-2 border-t border-border/60 pt-4">
              {rows.map((row) => (
                <li key={row.name} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: row.fill }}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
                  <span className="hidden text-muted-foreground tabular-nums sm:inline">
                    {formatNumber(row.count)} txns
                  </span>
                  <StatusBadge
                    size="sm"
                    status={
                      row.successRate === null
                        ? "unknown"
                        : row.successRate >= 95
                          ? "healthy"
                          : row.successRate >= 85
                            ? "degraded"
                            : "down"
                    }
                    className="hidden md:inline-flex"
                  />
                  <span className="w-14 text-right font-medium tabular-nums">
                    {formatPercent(row.successRate)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
