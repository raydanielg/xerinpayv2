import type { Metadata } from "next";

import { PortalShell } from "@/components/shell/portal-shell";

export const metadata: Metadata = {
  title: { default: "Dashboard · XerinPay", template: "%s · XerinPay" },
  robots: { index: false, follow: false },
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell variant="merchant">{children}</PortalShell>;
}
