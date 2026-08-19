import Link from "next/link";
import { Check, Minus } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const PLANS = [
  {
    name: "Starter",
    price: "1.4%",
    unit: "per mobile-money transaction",
    blurb: "For new businesses taking their first payments online.",
    cta: "Start free",
    href: "/auth/register",
    featured: false,
    features: [
      "No setup or monthly fee",
      "M-Pesa, Airtel, cards",
      "Hosted checkout & payment links",
      "Next-day settlement",
      "2FA, passkeys & audit log",
      "Email support",
    ],
    missing: ["Custom settlement schedule", "Dedicated account manager"],
  },
  {
    name: "Growth",
    price: "1.1%",
    unit: "per mobile-money transaction",
    blurb: "For scaling teams that need payouts, subscriptions, and speed.",
    cta: "Start free",
    href: "/auth/register",
    featured: true,
    features: [
      "Everything in Starter",
      "Same-day settlement",
      "Bulk payouts & split payments",
      "Subscriptions & smart retries",
      "IP allowlisting & granular RBAC",
      "Priority support, 4-hour response",
    ],
    missing: ["Dedicated account manager"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "volume-based interchange++",
    blurb: "For platforms and marketplaces at serious scale.",
    cta: "Talk to sales",
    href: "/auth/register",
    featured: false,
    features: [
      "Everything in Growth",
      "Interchange++ pricing",
      "Dedicated infrastructure & SLA",
      "SIEM log streaming & SSO/SAML",
      "Named account manager",
      "Compliance & audit support",
    ],
    missing: [],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Pay per transaction. Nothing else."
          description="No setup fees, no monthly minimums, no charge for failed attempts. Card rates start at 2.9% + KES 15 and fall with volume."
        />

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <Card
                className={cn(
                  "relative h-full p-7 transition-all duration-300",
                  plan.featured
                    ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.07] to-card shadow-xl lg:-translate-y-3"
                    : "border-border/60 bg-card/70 hover:-translate-y-1 hover:shadow-lg",
                )}
              >
                {plan.featured ? (
                  <Badge className="absolute -top-3 left-7 rounded-full bg-emerald-500 px-3 text-xs font-semibold text-white hover:bg-emerald-500">
                    Most popular
                  </Badge>
                ) : null}

                <h3 className="text-lg font-semibold tracking-tight">
                  {plan.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {plan.blurb}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.unit}
                </p>

                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>

                <ul className="mt-7 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span className="text-foreground/85">{feature}</span>
                    </li>
                  ))}
                  {plan.missing.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                      <span className="text-muted-foreground/70">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={280}>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            All plans include PCI DSS Level 1 processing, fraud scoring, signed
            webhooks, and the full audit log. Rates shown exclude VAT.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
