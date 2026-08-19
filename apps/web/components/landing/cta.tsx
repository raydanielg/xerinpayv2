import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

import { Reveal } from "@/components/landing/reveal";

export function Cta() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-emerald-500/12 via-card to-sky-500/10 px-6 py-16 text-center shadow-xl sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="xp-grid pointer-events-none absolute inset-0 -z-10 text-foreground opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[110px]"
          />

          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Take your first payment today
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Sandbox keys in seconds, live in 48 hours. No setup fee, no monthly
            minimum, no contract to sign before you write a line of code.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-12 w-full px-7 text-base sm:w-auto">
              <Link href="/auth/register">
                Create a free account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full px-7 text-base sm:w-auto"
            >
              <Link href="/auth/login">Sign in to dashboard</Link>
            </Button>
          </div>

          <p className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-500" />
            PCI DSS Level 1 · SOC 2 Type II · ISO 27001 certified
          </p>
        </div>
      </Reveal>
    </section>
  );
}
