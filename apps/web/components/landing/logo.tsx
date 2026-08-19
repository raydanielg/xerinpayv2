import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

export function XerinPayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <defs>
        <linearGradient id="xp-mark" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#xp-mark)" />
      <path
        d="M10 9.5 22 22.5M22 9.5 10 22.5"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx="16" cy="16" r="3.1" fill="white" />
    </svg>
  );
}

export function XerinPayLogo({
  className,
  wordmarkClassName,
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <XerinPayMark />
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          wordmarkClassName,
        )}
      >
        Xerin<span className="text-emerald-500">Pay</span>
      </span>
    </span>
  );
}
