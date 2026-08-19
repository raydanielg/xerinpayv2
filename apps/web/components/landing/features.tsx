import {
  ArrowLeftRight,
  Banknote,
  Boxes,
  Globe2,
  LineChart,
  Repeat,
  Smartphone,
  Webhook,
} from "lucide-react";

import { Card } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const FEATURES = [
  {
    icon: Smartphone,
    title: "Every local payment method",
    body: "M-Pesa, Airtel Money, MTN MoMo, cards, and direct bank debits behind a single charge object. Add a market without touching your checkout.",
    span: "lg:col-span-2",
    accent: "from-orange-500/15",
  },
  {
    icon: Banknote,
    title: "Same-day settlement",
    body: "Funds land in your bank or wallet the same working day — with a full ledger you can reconcile line by line.",
    accent: "from-amber-500/15",
  },
  {
    icon: Repeat,
    title: "Subscriptions & billing",
    body: "Recurring charges, retries, proration, and dunning handled for you, including mobile-money mandates.",
    accent: "from-violet-500/15",
  },
  {
    icon: ArrowLeftRight,
    title: "Payouts & split payments",
    body: "Pay suppliers, riders, or marketplace sellers in bulk. Split a single charge across many recipients atomically.",
    accent: "from-amber-500/15",
  },
  {
    icon: Webhook,
    title: "Reliable webhooks",
    body: "Signed, idempotent, and retried with exponential backoff for 72 hours. Replay any event from the dashboard.",
    accent: "from-teal-500/15",
  },
  {
    icon: LineChart,
    title: "Analytics that matter",
    body: "Authorisation rates, failure reasons, cohort revenue, and settlement timing — live, not batched overnight.",
    span: "lg:col-span-2",
    accent: "from-rose-500/15",
  },
  {
    icon: Globe2,
    title: "Multi-currency",
    body: "Accept in 32 currencies, settle in the one you hold. Mid-market FX with the spread shown up front.",
    accent: "from-indigo-500/15",
  },
  {
    icon: Boxes,
    title: "Plugins & no-code",
    body: "WooCommerce, Shopify, and payment links for teams that would rather not write a line of code.",
    accent: "from-cyan-500/15",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product"
          title="Everything you need to move money"
          description="A complete payments stack — collections, payouts, reconciliation, and reporting — without stitching together five vendors."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 60} className={feature.span}>
              <Card className="group relative h-full overflow-hidden border-border/60 bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg">
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    feature.accent,
                  )}
                />
                <div className="relative">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl border border-border/60 bg-background/70 text-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
