import { KeyRound, PlugZap, Rocket, Wallet } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const STEPS = [
  {
    icon: KeyRound,
    step: "01",
    title: "Create an account",
    body: "Sign up and get sandbox keys instantly. Full API access before any paperwork — test with simulated M-Pesa and card flows.",
  },
  {
    icon: PlugZap,
    step: "02",
    title: "Connect the API",
    body: "Drop in a checkout, use a hosted payment page, or call the REST API directly. SDKs for Node, Python, PHP, Go, and Java.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Go live in days",
    body: "Submit KYB documents through the dashboard. Most businesses are approved and taking live payments within 48 hours.",
  },
  {
    icon: Wallet,
    step: "04",
    title: "Get settled",
    body: "Track every charge, refund, and payout in one ledger. Money reaches your account the same working day.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-muted/25 py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="xp-dots pointer-events-none absolute inset-0 text-foreground opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From signup to settlement in four steps"
          description="No lengthy onboarding calls, no integration consultants. Read the docs, ship the integration, take payments."
        />

        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* connector line */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-7 hidden h-px w-full lg:block"
            preserveAspectRatio="none"
            viewBox="0 0 1000 2"
          >
            <line
              x1="60"
              y1="1"
              x2="940"
              y2="1"
              stroke="currentColor"
              className="xp-dash text-border"
              strokeWidth="2"
            />
          </svg>

          {STEPS.map((item, i) => (
            <Reveal key={item.step} delay={i * 110} className="relative">
              <li className="list-none">
                <span className="relative z-10 inline-flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                  <item.icon className="size-6 text-emerald-500" />
                </span>
                <p className="mt-5 font-mono text-xs font-semibold tracking-widest text-muted-foreground">
                  STEP {item.step}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
