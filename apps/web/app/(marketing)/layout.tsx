import type { Metadata } from "next";

import { MarketingFooter } from "@/components/landing/marketing-footer";
import { MarketingNav } from "@/components/landing/marketing-nav";

export const metadata: Metadata = {
  title: "XerinPay — Payment infrastructure for Africa",
  description:
    "One API for mobile money, cards, and bank transfers. PCI DSS Level 1 security, real-time fraud scoring, and same-day settlement.",
  keywords: [
    "payment gateway",
    "M-Pesa API",
    "payments Tanzania",
    "payment infrastructure Africa",
    "PCI DSS",
    "payouts",
  ],
  openGraph: {
    title: "XerinPay — Payment infrastructure for Africa",
    description:
      "One API for mobile money, cards, and bank transfers. Integrate in an afternoon, settle the same day.",
    type: "website",
    siteName: "XerinPay",
  },
  twitter: {
    card: "summary_large_image",
    title: "XerinPay — Payment infrastructure for Africa",
    description:
      "One API for mobile money, cards, and bank transfers. Integrate in an afternoon, settle the same day.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <MarketingNav />

      <main id="main" className="flex-1">
        {children}
      </main>

      <MarketingFooter />
    </div>
  );
}
