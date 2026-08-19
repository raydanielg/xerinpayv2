"use client";

import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

type RevealProps = React.ComponentProps<"div"> & {
  /** Delay in ms before the element animates in. */
  delay?: number;
  /** Direction the element travels from. */
  from?: "up" | "down" | "left" | "right" | "none";
  /** Only animate once (default) or every time it enters the viewport. */
  once?: boolean;
};

const OFFSETS: Record<NonNullable<RevealProps["from"]>, string> = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "-translate-x-8",
  right: "translate-x-8",
  none: "scale-[0.97]",
};

/**
 * Lightweight scroll-reveal wrapper.
 *
 * Uses IntersectionObserver + CSS transitions only (no animation library), and
 * fully respects `prefers-reduced-motion` by rendering the final state at once.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "up",
  once = true,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out",
        visible
          ? "opacity-100 translate-x-0 translate-y-0 scale-100 blur-none"
          : cn("opacity-0 motion-safe:blur-[2px]", OFFSETS[from]),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
