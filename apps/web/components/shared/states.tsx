import * as React from "react";
import { AlertCircle, Inbox, Lock, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/**
 * A 403 is not an error the user can fix by retrying, so it gets its own
 * message rather than a generic "something went wrong".
 */
export function ErrorState({
  status,
  message,
  onRetry,
  className,
}: {
  status?: number;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const forbidden = status === 403;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-destructive/10">
        {forbidden ? (
          <Lock className="size-5 text-destructive" />
        ) : (
          <AlertCircle className="size-5 text-destructive" />
        )}
      </span>
      <p className="mt-4 text-sm font-medium">
        {forbidden ? "You don't have access to this" : "Couldn't load this"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {message ??
          (forbidden
            ? "Ask an administrator to grant you the relevant permission."
            : "The request failed. This is usually temporary.")}
      </p>
      {!forbidden && onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-2 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4", c === 0 ? "w-32" : c === cols - 1 ? "w-20" : "flex-1")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
