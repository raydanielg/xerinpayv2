import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

/**
 * A stat tile, not a chart.
 *
 * The number is the point, so it gets the size. The delta carries an arrow as
 * well as a colour — direction must survive greyscale — and `positiveIsGood`
 * exists because a rising failure count is not good news.
 */
export function MetricCard({
  label,
  value,
  delta,
  deltaLabel = "vs last period",
  positiveIsGood = true,
  icon: Icon,
  hint,
  loading,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number | null;
  deltaLabel?: string;
  positiveIsGood?: boolean;
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
  className?: string;
}) {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta);
  const rising = hasDelta && delta > 0;
  const flat = hasDelta && delta === 0;
  const good = rising === positiveIsGood;

  const DeltaIcon = flat ? Minus : rising ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className={cn("gap-0 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-9 w-32" />
      ) : (
        <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
          {value}
        </p>
      )}

      <div className="mt-3 flex min-h-5 items-center gap-2 text-xs">
        {loading ? (
          <Skeleton className="h-4 w-28" />
        ) : hasDelta ? (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                flat
                  ? "text-muted-foreground"
                  : good
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
              )}
            >
              <DeltaIcon className="size-3.5" aria-hidden />
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </>
        ) : hint ? (
          <span className="text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </Card>
  );
}
