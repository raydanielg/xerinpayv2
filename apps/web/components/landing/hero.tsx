import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

import { Reveal } from "@/components/landing/reveal";

const FEED = [
  { id: "ch_8f21", method: "M-Pesa", amount: "TZS 4,500", state: "Settled" },
  { id: "ch_9b04", method: "Visa", amount: "USD 129.00", state: "Captured" },
  { id: "ch_2d77", method: "Airtel", amount: "TZS 1,200", state: "Settled" },
  { id: "ch_5a19", method: "Mastercard", amount: "EUR 89.90", state: "3-DS ok" },
  { id: "ch_7c53", method: "Bank", amount: "TZS 250,000", state: "Settled" },
  { id: "ch_1e46", method: "M-Pesa", amount: "TZS 780", state: "Captured" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-24">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="xp-grid absolute inset-0 text-foreground opacity-[0.45] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,black,transparent)]" />
        <div className="absolute left-1/2 top-[-16rem] size-[42rem] -translate-x-1/2 rounded-full bg-orange-500/20 blur-[120px] dark:bg-orange-500/15" />
        <div className="absolute right-[-10rem] top-24 size-[30rem] rounded-full bg-amber-500/15 blur-[110px] dark:bg-amber-500/10" />
        <div className="absolute bottom-[-12rem] left-[-8rem] size-[26rem] rounded-full bg-orange-400/10 blur-[110px]" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8">
        {/* Copy */}
        <div className="max-w-2xl">
          <Reveal>
            <Badge
              variant="secondary"
              className="gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-orange-700 dark:text-orange-300"
            >
              <span className="relative flex size-1.5">
                <span className="xp-pulse-ring absolute inline-flex size-full rounded-full bg-orange-500" />
                <span className="relative inline-flex size-1.5 rounded-full bg-orange-500" />
              </span>
              PCI DSS Level 1 · Live in 14 markets
            </Badge>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-pretty text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.15rem]">
              Payment infrastructure{" "}
              <span className="xp-shimmer-text bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                built for Africa&apos;s
              </span>{" "}
              internet economy.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              One API for mobile money, cards, and bank transfers. Bank-grade
              encryption, real-time fraud scoring, and same-day settlement —
              integrate in an afternoon, scale to millions of transactions.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button render={<Link href="/auth/register" />} size="lg" className="group h-12 px-6 text-base">
                Start integrating free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                render={<a href="#developers" />}
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                <Terminal className="size-4" />
                View the docs
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {[
                { icon: CheckCircle2, label: "No setup or monthly fees" },
                { icon: ShieldCheck, label: "PCI DSS Level 1 certified" },
                { icon: BadgeCheck, label: "Same-day settlement" },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <item.icon className="size-4 shrink-0 text-orange-500" />
                  {item.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Visual */}
        <Reveal delay={200} from="none" className="relative">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* glow */}
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-orange-500/20 via-transparent to-amber-500/20 blur-2xl"
            />

            {/* Console card */}
            <div className="xp-float-slow overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl ring-1 ring-white/5 dark:shadow-black/40">
              <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-400/80" />
                  <span className="size-2.5 rounded-full bg-amber-400/80" />
                  <span className="size-2.5 rounded-full bg-orange-400/80" />
                </div>
                <p className="ml-2 text-xs font-medium text-muted-foreground">
                  dashboard.xerinpay.com
                </p>
                <span className="ml-auto flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                  <Lock className="size-3" />
                  TLS 1.3
                </span>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Volume today
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                      TZS 8,412,930
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                    +18.4%
                  </span>
                </div>

                {/* sparkline */}
                <svg
                  viewBox="0 0 320 72"
                  className="h-16 w-full"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="xp-spark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(249 115 22)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="rgb(249 115 22)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 58 L32 50 L64 54 L96 38 L128 44 L160 26 L192 32 L224 18 L256 24 L288 10 L320 14 L320 72 L0 72 Z"
                    fill="url(#xp-spark)"
                  />
                  <path
                    d="M0 58 L32 50 L64 54 L96 38 L128 44 L160 26 L192 32 L224 18 L256 24 L288 10 L320 14"
                    fill="none"
                    stroke="rgb(249 115 22)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* live feed */}
                <div className="rounded-xl border border-border/70 bg-background/60">
                  <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
                    <p className="text-xs font-semibold">Live transactions</p>
                    <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      <span className="size-1.5 animate-pulse rounded-full bg-orange-500" />
                      streaming
                    </span>
                  </div>
                  <div className="h-[132px] overflow-hidden">
                    <div className="xp-feed-track">
                      {[...FEED, ...FEED].map((row, i) => (
                        <div
                          key={`${row.id}-${i}`}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs"
                        >
                          <span className="font-mono text-muted-foreground">
                            {row.id}
                          </span>
                          <span className="text-muted-foreground">
                            {row.method}
                          </span>
                          <span className="font-medium tabular-nums">
                            {row.amount}
                          </span>
                          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 font-medium text-orange-600 dark:text-orange-400">
                            {row.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* floating chips */}
            <div className="xp-float absolute -left-4 top-24 hidden rounded-xl border border-border/70 bg-card/90 px-3 py-2 shadow-lg backdrop-blur-md sm:block">
              <p className="flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="size-3.5 text-orange-500" />
                Fraud score 0.02
              </p>
            </div>
            <div
              className="xp-float absolute -right-3 bottom-16 hidden rounded-xl border border-border/70 bg-card/90 px-3 py-2 shadow-lg backdrop-blur-md sm:block"
              style={{ animationDelay: "1.4s" }}
            >
              <p className="flex items-center gap-2 text-xs font-medium">
                <Sparkles className="size-3.5 text-amber-500" />
                142ms auth latency
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
