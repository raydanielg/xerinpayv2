import Link from "next/link";
import { AtSign, GitFork, Globe, Mail, MapPin } from "lucide-react";

import { Separator } from "@workspace/ui/components/separator";

import { XerinPayLogo } from "@/components/landing/logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Payments", href: "#features" },
      { label: "Payouts", href: "#features" },
      { label: "Subscriptions", href: "#features" },
      { label: "Payment links", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API reference", href: "#developers" },
      { label: "SDKs", href: "#developers" },
      { label: "Webhooks", href: "#developers" },
      { label: "Sandbox", href: "/auth/register" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Security",
    links: [
      { label: "Overview", href: "#security" },
      { label: "Compliance", href: "#security" },
      { label: "Bug bounty", href: "#security" },
      { label: "Report a vulnerability", href: "#security" },
      { label: "Trust centre", href: "#security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Partners", href: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: Globe, label: "XerinPay on X", href: "#" },
  { icon: GitFork, label: "XerinPay on GitHub", href: "#" },
  { icon: AtSign, label: "XerinPay on LinkedIn", href: "#" },
  { icon: Mail, label: "Email XerinPay", href: "mailto:hello@xerinpay.com" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/25">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="max-w-sm">
            <XerinPayLogo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Payment infrastructure for Africa&apos;s internet economy. One API
              for mobile money, cards, and bank transfers.
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              Westlands, Nairobi · Kenya
            </p>
            <ul className="mt-5 flex gap-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:border-border hover:text-foreground"
                  >
                    <social.icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} XerinPay Ltd. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {["Privacy", "Terms", "Cookies", "Acceptable use", "DPA"].map(
              (item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground/70">
          XerinPay Ltd is a licensed Payment Service Provider. Card processing is
          performed in a PCI DSS Level 1 certified environment. Figures shown on
          this page are illustrative.
        </p>
      </div>
    </footer>
  );
}
