import type { Metadata } from "next";

import { PortalShell } from "@/components/shell/portal-shell";

export const metadata: Metadata = {
  title: { default: "Admin · XerinPay", template: "%s · XerinPay Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell variant="admin">{children}</PortalShell>;
}
