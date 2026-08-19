import * as React from "react";
import Image from "next/image";

import { cn } from "@workspace/ui/lib/utils";

export function XerinPayMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="XerinPay"
      width={32}
      height={32}
      className={cn("size-8", className)}
      priority
    />
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
        <span className="text-orange-500">Xerin</span><span>Pay</span>
      </span>
    </span>
  );
}
