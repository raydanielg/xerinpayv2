"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card } from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";

import { EmptyState, ErrorState } from "@/components/shared/states";
import { formatMoney } from "@/lib/format";
import type { ApiError } from "@/lib/api/client";
import type { Currency, TimeSeriesPoint } from "@/lib/api/types";

/**
 * Volume over time.
 *
 * One series, one axis. A single series needs no legend — the card title names
 * it — and no number is printed on every point; the tooltip carries the detail
 * on hover. Grid and axes stay recessive so the shape of the data is what you
 * see first.
 */

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;

export type Range = (typeof RANGES)[number]["value"];

const config = {
  volume: { label: "Volume", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function VolumeChart({
  data,
  currency = "TZS",
  isLoading,
  error,
  range,
  onRangeChange,
  title = "Transaction volume",
  description,
}: {
  data?: TimeSeriesPoint[];
  currency?: Currency;
  isLoading?: boolean;
  error?: ApiError | null;
  range: Range;
  onRangeChange: (range: Range) => void;
  title?: string;
  description?: string;
}) {
  const points = React.useMemo(
    () =>
      (data ?? []).map((p) => ({
        ...p,
        // Recharts needs a plain label; keep the ISO value for the tooltip.
        label: new Date(p.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
      })),
    [data],
  );

  return (
    <Card className="gap-0 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(value) => value && onRangeChange(value as Range)}
          variant="outline"
          size="sm"
          className="shrink-0"
        >
          {RANGES.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value} className="px-3 text-xs">
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : error ? (
          <ErrorState status={error.status} message={error.detail} className="h-[260px]" />
        ) : points.length === 0 ? (
          <EmptyState
            title="No transactions in this period"
            description="Once payments start coming in, the trend appears here."
            className="h-[260px] py-0"
          />
        ) : (
          <ChartContainer config={config} className="h-[260px] w-full">
            <AreaChart data={points} margin={{ left: 4, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="xp-volume-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-volume)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-volume)" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={28}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickMargin={8}
                className="text-xs"
                tickFormatter={(value: number) =>
                  formatMoney(value, currency, { compact: true, showCode: false })
                }
              />

              <ChartTooltip
                cursor={{ strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => formatMoney(Number(value), currency)}
                  />
                }
              />

              <Area
                dataKey="volume"
                type="monotone"
                stroke="var(--color-volume)"
                strokeWidth={2}
                fill="url(#xp-volume-fill)"
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
}
