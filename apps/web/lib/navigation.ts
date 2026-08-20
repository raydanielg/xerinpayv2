import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Blocks,
  CreditCard,
  FileSearch,
  Gauge,
  KeyRound,
  Landmark,
  Link2,
  ListChecks,
  Receipt,
  RefreshCcw,
  Scale,
  Shield,
  ShieldCheck,
  Store,
  UserCog,
  Users,
  Wallet,
  Webhook,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  /** Item is hidden unless the user holds this permission. */
  permission?: string;
  /** Or any one of these. */
  anyPermission?: string[];
  badgeKey?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/* ------------------------------------------------------------ admin nav */

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: Gauge, permission: "dashboard.view" },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Merchants", href: "/admin/merchants", icon: Store, permission: "merchants.view" },
      { title: "Customers", href: "/admin/customers", icon: Users, permission: "customers.view" },
      {
        title: "KYC",
        href: "/admin/kyc",
        icon: BadgeCheck,
        permission: "kyc.view",
        badgeKey: "kyc_pending",
      },
    ],
  },
  {
    label: "Payments",
    items: [
      {
        title: "Transactions",
        href: "/admin/transactions",
        icon: CreditCard,
        permission: "transactions.view",
      },
      {
        title: "Refunds",
        href: "/admin/refunds",
        icon: RefreshCcw,
        permission: "refunds.view",
        badgeKey: "refunds_pending",
      },
      {
        title: "Webhooks",
        href: "/admin/webhooks",
        icon: Webhook,
        permission: "webhooks.view",
        badgeKey: "webhooks_failed",
      },
    ],
  },
  {
    label: "Providers",
    items: [
      { title: "Providers", href: "/admin/providers", icon: Blocks, permission: "providers.view" },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Fees", href: "/admin/fees", icon: Receipt, permission: "fees.view" },
      {
        title: "Settlements",
        href: "/admin/settlements",
        icon: Wallet,
        permission: "settlements.view",
      },
      { title: "Ledger", href: "/admin/ledger", icon: Scale, permission: "ledger.view" },
      {
        title: "Reconciliation",
        href: "/admin/reconciliation",
        icon: ListChecks,
        permission: "reconciliation.view",
        badgeKey: "recon_unresolved",
      },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3, permission: "reports.view" },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Staff", href: "/admin/staff", icon: UserCog, permission: "staff.view" },
      { title: "Roles", href: "/admin/roles", icon: Shield, permission: "roles.view" },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Audit logs",
        href: "/admin/audit",
        icon: FileSearch,
        permission: "system.audit_logs",
      },
    ],
  },
];

/* --------------------------------------------------------- merchant nav */

export const MERCHANT_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: Gauge }],
  },
  {
    label: "Payments",
    items: [
      { title: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
      { title: "Payment links", href: "/dashboard/payment-links", icon: Link2 },
      { title: "Customers", href: "/dashboard/customers", icon: Users },
      { title: "Refunds", href: "/dashboard/refunds", icon: RefreshCcw },
    ],
  },
  {
    label: "Money",
    items: [
      { title: "Balance", href: "/dashboard/balance", icon: Wallet },
      { title: "Settlements", href: "/dashboard/settlements", icon: Landmark },
      { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Developers",
    items: [
      { title: "API keys", href: "/dashboard/developers/keys", icon: KeyRound },
      { title: "Webhooks", href: "/dashboard/developers/webhooks", icon: Webhook },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Security", href: "/dashboard/settings/security", icon: ShieldCheck },
    ],
  },
];

/**
 * Filters a nav tree down to what the user is allowed to see, dropping any
 * group left empty. A Support Agent and a Finance Officer therefore get two
 * genuinely different sidebars from one definition.
 */
export function filterNav(
  groups: NavGroup[],
  can: (permission: string) => boolean,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.permission && !can(item.permission)) return false;
        if (item.anyPermission?.length && !item.anyPermission.some(can)) return false;
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);
}

/** Kept for the Activity view once it lands. */
export const ACTIVITY_ICON = Activity;
