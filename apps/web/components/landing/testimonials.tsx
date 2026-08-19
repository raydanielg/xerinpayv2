import { Quote, Star } from "lucide-react";

import { Card } from "@workspace/ui/components/card";

import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const TESTIMONIALS = [
  {
    quote:
      "We moved off two separate providers and cut our failed-payment rate by a third in the first month. The webhook reliability alone paid for the migration.",
    name: "Amina Wanjiru",
    role: "CTO, Sokoni Commerce",
    initials: "AW",
  },
  {
    quote:
      "The sandbox is the best I've used in this region. I had a working M-Pesa flow before lunch, including the failure cases I actually needed to handle.",
    name: "David Otieno",
    role: "Lead Engineer, Tuma Logistics",
    initials: "DO",
  },
  {
    quote:
      "Our auditors asked for the audit trail and SOC 2 report and we sent both the same day. That has never happened with a payments vendor before.",
    name: "Grace Mbeki",
    role: "Head of Finance, Zawadi Health",
    initials: "GM",
  },
];

export function Testimonials() {
  return (
    <section
      aria-label="Customer stories"
      className="border-y border-border/60 bg-muted/25 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Customers"
          title="Teams that ship, ship on XerinPay"
          description="From single-founder stores to platforms settling millions a month."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.name} delay={i * 110}>
              <Card className="relative flex h-full flex-col justify-between border-border/60 bg-card/80 p-7">
                <Quote
                  aria-hidden
                  className="absolute right-6 top-6 size-8 text-muted-foreground/15"
                />
                <div>
                  <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <blockquote className="mt-5 text-sm leading-relaxed text-foreground/90">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-border/60 pt-5">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-semibold text-white">
                    {item.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">
                      {item.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.role}
                    </span>
                  </span>
                </figcaption>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
