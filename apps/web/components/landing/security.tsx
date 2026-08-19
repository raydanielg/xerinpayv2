import {
  Activity,
  Ban,
  Cpu,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  Radar,
  ScrollText,
  ServerCog,
  ShieldCheck,
  Siren,
} from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";

import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const PILLARS = [
  {
    icon: Lock,
    title: "Encrypted end to end",
    body: "TLS 1.3 in transit, AES-256-GCM at rest, and per-tenant data keys rotated automatically. Card data never touches your servers.",
    points: ["TLS 1.3 only", "AES-256-GCM", "Automatic key rotation"],
  },
  {
    icon: KeyRound,
    title: "Keys held in HSMs",
    body: "Cryptographic material lives in FIPS 140-2 Level 3 hardware modules. No engineer — ours or yours — can export a private key.",
    points: ["FIPS 140-2 L3", "Dual-control access", "Zero key export"],
  },
  {
    icon: Fingerprint,
    title: "Tokenised vault",
    body: "Real PANs are replaced with reversible tokens scoped to your account, so a leaked token is worthless anywhere else.",
    points: ["Network tokenisation", "Scoped tokens", "PAN never stored"],
  },
  {
    icon: Radar,
    title: "Fraud scoring in 40ms",
    body: "Every charge is scored by a model trained on regional fraud patterns — device fingerprint, velocity, BIN risk, and behavioural signals.",
    points: ["Device fingerprinting", "Velocity rules", "Adaptive 3-D Secure"],
  },
  {
    icon: Siren,
    title: "AML & sanctions screening",
    body: "Counterparties are screened against global sanctions and PEP lists in real time, with case management built into the dashboard.",
    points: ["Real-time screening", "PEP & adverse media", "Audit-ready cases"],
  },
  {
    icon: ScrollText,
    title: "Immutable audit trail",
    body: "Every API call, dashboard action, and permission change is written to a tamper-evident log you can export or stream to your SIEM.",
    points: ["Append-only log", "SIEM streaming", "7-year retention"],
  },
];

const ACCOUNT_CONTROLS = [
  { icon: Fingerprint, label: "Passkeys & WebAuthn", detail: "Phishing-resistant sign-in for every dashboard user." },
  { icon: ShieldCheck, label: "Enforced 2FA", detail: "TOTP or hardware keys, mandatory org-wide." },
  { icon: Eye, label: "Granular RBAC", detail: "Scope each teammate to the exact resources they need." },
  { icon: Ban, label: "IP allowlisting", detail: "Restrict live API keys to your own egress ranges." },
  { icon: ServerCog, label: "Signed webhooks", detail: "HMAC-SHA256 signatures with replay protection." },
  { icon: Cpu, label: "Idempotency keys", detail: "Retry safely — a customer is never charged twice." },
];

const CERTS = [
  "PCI DSS Level 1",
  "SOC 2 Type II",
  "ISO 27001",
  "GDPR",
  "Kenya DPA 2019",
  "PSD2 / SCA",
];

export function Security() {
  return (
    <section
      id="security"
      className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[46rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[130px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Security"
          title="Security is the product, not a feature"
          description="XerinPay is built to the standards regulators and acquiring banks audit us against — and we hand you the same controls for your own account."
        />

        {/* Headline stats */}
        <Reveal delay={80}>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "99.995%", label: "Platform uptime, 12-month rolling" },
              { value: "40ms", label: "Median fraud decision time" },
              { value: "0.008%", label: "Fraud-to-volume ratio" },
              { value: "24/7", label: "Security operations centre" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card px-6 py-7 text-center">
                <p className="text-3xl font-semibold tracking-tight text-orange-500 tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Pillars */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 70}>
              <Card className="group relative h-full overflow-hidden border-border/60 bg-card/70 p-6 transition-colors hover:border-orange-500/40">
                <div
                  aria-hidden
                  className="xp-scan pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100"
                />
                <div className="relative">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20 dark:text-orange-400">
                    <pillar.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {pillar.body}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {pillar.points.map((point) => (
                      <li key={point}>
                        <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Account controls + certifications */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <Card className="h-full border-border/60 bg-card/70 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Activity className="size-5 text-orange-500" />
                <h3 className="text-lg font-semibold tracking-tight">
                  Controls you hold yourself
                </h3>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Most breaches start with an account, not an algorithm. Every
                control below is available on the free tier — no enterprise
                upsell for basic safety.
              </p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {ACCOUNT_CONTROLS.map((control) => (
                  <li key={control.label} className="flex gap-3">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background">
                      <control.icon className="size-4 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{control.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {control.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card className="flex h-full flex-col justify-between border-border/60 bg-gradient-to-br from-orange-500/10 via-card to-amber-500/5 p-6 sm:p-8">
              <div>
                <ShieldCheck className="size-8 text-orange-500" />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  Audited, certified, and independently tested
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Annual penetration tests by an accredited third party, a
                  public bug bounty, and quarterly ASV scans — reports available
                  under NDA.
                </p>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {CERTS.map((cert) => (
                  <li key={cert}>
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium"
                    >
                      {cert}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
