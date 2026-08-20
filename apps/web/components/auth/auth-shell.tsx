import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { XerinPayLogo } from "@/components/landing/logo";

/**
 * Split layout shared by every auth screen: form on the left, trust panel on
 * the right. The right panel collapses away below `lg` so phones get a clean
 * single column instead of a squashed two-up.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-8 p-6 sm:p-10">
        <Link href="/" className="w-fit">
          <XerinPayLogo />
          <span className="sr-only">XerinPay home</span>
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
            <div className="mt-8">{children}</div>
            {footer ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Protected by rate limiting, device checks, and audit logging.
        </p>
      </div>

      {/* Trust panel */}
      <div className="relative hidden overflow-hidden border-l border-border/60 bg-muted/30 lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10"
        />
        <div className="relative flex h-full flex-col justify-center gap-8 p-12 xl:p-16">
          <blockquote className="max-w-md">
            <p className="text-2xl font-medium leading-snug tracking-tight">
              &ldquo;Payments are a trust business. Everything we build starts
              from that.&rdquo;
            </p>
          </blockquote>

          <ul className="grid max-w-md gap-4">
            {[
              {
                title: "Tokens never touch your browser storage",
                body: "Sessions live in httpOnly cookies, so a script injection cannot lift them.",
              },
              {
                title: "Every privileged action is logged",
                body: "Who, what, before, after, from which IP — immutable and exportable.",
              },
              {
                title: "Two-factor on every staff account",
                body: "Authenticator app or hardware key, enforced organisation-wide.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
