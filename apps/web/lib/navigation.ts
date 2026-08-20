import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  Blocks,
  Book,
  Building2,
  CircleDollarSign,
  Code2,
  CreditCard,
  FileSearch,
  FileText,
  Gauge,
  KeyRound,
  Landmark,
  Link2,
  ListChecks,
  Users,
  Receipt,
  RefreshCcw,
  Repeat,
  Scale,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Truck,
  UserCog,
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
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        permission: "dashboard.analytics",
      },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Merchants", href: "/admin/merchants", icon: Store, permission: "merchants.view" },
      { title: "Customers", href: "/admin/customers", icon: Users, permission: "customers.view" },
      { title: "KYC", href: "/admin/kyc", icon: BadgeCheck, permission: "kyc.view", badgeKey: "kyc_pending" },
      {
        title: "Applications",
        href: "/admin/applications",
        icon: FileText,
        permission: "merchants.view",
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
        title: "Payment attempts",
        href: "/admin/attempts",
        icon: Repeat,
        permission: "payments.view",
      },
      { title: "Refunds", href: "/admin/refunds", icon: RefreshCcw, permission: "refunds.view", badgeKey: "refunds_pending" },
      { title: "Payment links", href: "/admin/payment-links", icon: Link2, permission: "payments.view" },
      { title: "Webhooks", href: "/admin/webhooks", icon: Webhook, permission: "webhooks.view", badgeKey: "webhooks_failed" },
    ],
  },
  {
    label: "Providers",
    items: [
      { title: "Providers", href: "/admin/providers", icon: Blocks, permission: "providers.view" },
      {
        title: "Provider accounts",
        href: "/admin/providers/accounts",
        icon: Landmark,
        permission: "providers.view",
      },
      {
        title: "Routing rules",
        href: "/admin/providers/routing",
        icon: Truck,
        permission: "providers.configure",
      },
      {
        title: "Provider logs",
        href: "/admin/providers/logs",
        icon: FileSearch,
        permission: "providers.view",
      },
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
      {
        title: "Payouts",
        href: "/admin/payouts",
        icon: CircleDollarSign,
        permission: "settlements.view",
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
      { title: "Activity", href: "/admin/activity", icon: Activity, permission: "staff.view" },
    ],
  },
  {
    label: "Developer",
    items: [
      {
        title: "API applications",
        href: "/admin/developer/apps",
        icon: Code2,
        permission: "developer.view",
      },
      {
        title: "API logs",
        href: "/admin/developer/logs",
        icon: FileSearch,
        permission: "developer.logs.view",
      },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings, permission: "system.settings" },
      {
        title: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        permission: "system.notifications",
      },
      {
        title: "Audit logs",
        href: "/admin/audit",
        icon: FileSearch,
        permission: "system.audit_logs",
      },
      { title: "Security", href: "/admin/security", icon: ShieldCheck, permission: "system.security" },
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
      { title: "API logs", href: "/dashboard/developers/logs", icon: FileSearch },
      { title: "Documentation", href: "/dashboard/developers/docs", icon: Book },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Business profile", href: "/dashboard/settings/business", icon: Building2 },
      { title: "Team", href: "/dashboard/settings/team", icon: UserCog },
      { title: "Security", href: "/dashboard/settings/security", icon: ShieldCheck },
      { title: "Preferences", href: "/dashboard/settings", icon: SlidersHorizontal },
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
