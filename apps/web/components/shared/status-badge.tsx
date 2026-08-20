import * as React from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  HelpCircle,
  Hourglass,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

/**
 * Status is never communicated by colour alone: every badge carries an icon and
 * a word. That is what makes it readable for colour-blind users, in greyscale
 * print, and in forced-colours mode.
 *
 * These four tones are reserved for state. They are deliberately NOT the chart
 * categorical palette — a "series 4" must never look like a failure.
 */
type Tone = "good" | "warning" | "serious" | "critical" | "neutral" | "info";

const TONE_CLASS: Record<Tone, string> = {
  good: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400",
  serious: "bg-orange-500/10 text-orange-700 ring-orange-500/25 dark:text-orange-400",
  critical: "bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-400",
  info: "bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-400",
  neutral: "bg-muted text-muted-foreground ring-border",
};

interface StatusMeta {
  tone: Tone;
  icon: LucideIcon;
  label?: string;
}

/**
 * One map for every status in the system — payments, refunds, settlements,
 * merchants, KYC, reconciliation, webhook deliveries. Unknown values fall back
 * to a neutral badge rather than throwing.
 */
const STATUS: Record<string, StatusMeta> = {
  // payment / transaction
  CREATED: { tone: "neutral", icon: CircleDashed },
  INITIATED: { tone: "info", icon: Clock },
  PROCESSING: { tone: "info", icon: Hourglass },
  SUCCESS: { tone: "good", icon: CheckCircle2 },
  FAILED: { tone: "critical", icon: XCircle },
  EXPIRED: { tone: "warning", icon: Clock },
  CANCELLED: { tone: "neutral", icon: Ban },
  REFUND_REQUESTED: { tone: "warning", icon: RotateCcw, label: "Refund requested" },
  PARTIALLY_REFUNDED: { tone: "warning", icon: RotateCcw, label: "Partially refunded" },
  REFUNDED: { tone: "info", icon: RotateCcw },

  // refunds
  REQUESTED: { tone: "warning", icon: Clock },
  PENDING_APPROVAL: { tone: "warning", icon: Hourglass, label: "Pending approval" },
  APPROVED: { tone: "good", icon: CheckCircle2 },
  REJECTED: { tone: "critical", icon: XCircle },
  COMPLETED: { tone: "good", icon: CheckCircle2 },

  // merchants / kyc
  DRAFT: { tone: "neutral", icon: CircleDashed },
  SUBMITTED: { tone: "info", icon: Clock },
  UNDER_REVIEW: { tone: "info", icon: Hourglass, label: "Under review" },
  ACTION_REQUIRED: { tone: "warning", icon: AlertTriangle, label: "Action required" },
  SUSPENDED: { tone: "critical", icon: ShieldAlert },
  NOT_STARTED: { tone: "neutral", icon: CircleDashed, label: "Not started" },
  PENDING: { tone: "warning", icon: Hourglass },

  // settlements
  REVERSED: { tone: "serious", icon: RotateCcw },

  // reconciliation
  MATCHED: { tone: "good", icon: CheckCircle2 },
  MISSING_PROVIDER: { tone: "serious", icon: AlertTriangle, label: "Missing at provider" },
  MISSING_XERINPAY: { tone: "serious", icon: AlertTriangle, label: "Missing at XerinPay" },
  AMOUNT_MISMATCH: { tone: "critical", icon: AlertTriangle, label: "Amount mismatch" },
  STATUS_MISMATCH: { tone: "warning", icon: AlertTriangle, label: "Status mismatch" },
  DUPLICATE: { tone: "serious", icon: AlertTriangle },

  // webhook deliveries / providers
  delivered: { tone: "good", icon: CheckCircle2 },
  failed: { tone: "critical", icon: XCircle },
  retrying: { tone: "warning", icon: RotateCcw },
  pending: { tone: "info", icon: Clock },
  healthy: { tone: "good", icon: CheckCircle2 },
  degraded: { tone: "warning", icon: AlertTriangle },
  down: { tone: "critical", icon: XCircle },
  unknown: { tone: "neutral", icon: HelpCircle },
};

function humanise(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  className,
  size = "default",
}: {
  status: string | null | undefined;
  className?: string;
  size?: "default" | "sm";
}) {
  if (!status) {
    return <span className="text-muted-foreground">—</span>;
  }

  const meta = STATUS[status] ?? STATUS[status.toUpperCase()] ?? {
    tone: "neutral" as const,
    icon: HelpCircle,
  };
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONE_CLASS[meta.tone],
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {meta.label ?? humanise(status)}
    </span>
  );
}
