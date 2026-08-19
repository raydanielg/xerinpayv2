"use client";

import * as React from "react";

type StatItem = {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  decimals?: number;
};

const STATS: StatItem[] = [
  { value: 4200, prefix: "", suffix: "+", label: "Businesses live on XerinPay" },
  { value: 96, prefix: "TZS ", suffix: "B", label: "Processed in the last year" },
  { value: 14, prefix: "", suffix: "", label: "Markets across the continent" },
  {
    value: 99.995,
    prefix: "",
    suffix: "%",
    label: "Uptime, 12-month rolling",
    decimals: 3,
  },
];

function useCountUp(target: number, decimals = 0) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setValue(target);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const duration = 1500;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutExpo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setValue(target * eased);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return { ref, formatted };
}

function Stat({ value, prefix, suffix, label, decimals = 0 }: StatItem) {
  const { ref, formatted } = useCountUp(value, decimals);

  return (
    <div className="text-center">
      <p
        ref={ref}
        className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl"
      >
        {prefix}
        {formatted}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function Stats() {
  return (
    <section
      aria-label="XerinPay by the numbers"
      className="py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
