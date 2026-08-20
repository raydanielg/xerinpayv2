/**
 * Permission catalog.
 *
 * Mirrors the backend's `apps/rbac/catalog.py`. Roles are NOT hard-coded
 * anywhere in the UI — an admin can create a role with any subset of these
 * permissions and the interface adapts, because every gate checks a permission
 * string rather than a role name.
 */

export const PERMISSIONS = {
  dashboard: ["dashboard.view", "dashboard.analytics"],
  merchants: [
    "merchants.view",
    "merchants.create",
    "merchants.update",
    "merchants.suspend",
    "merchants.delete",
    "merchants.verify",
  ],
  customers: ["customers.view", "customers.create", "customers.update", "customers.export"],
  transactions: [
    "transactions.view",
    "transactions.search",
    "transactions.export",
    "transactions.update",
    "transactions.retry",
  ],
  payments: [
    "payments.view",
    "payments.create",
    "payments.retry",
    "payments.cancel",
    "payments.refund",
  ],
  refunds: ["refunds.view", "refunds.create", "refunds.approve", "refunds.reject"],
  providers: [
    "providers.view",
    "providers.create",
    "providers.update",
    "providers.enable",
    "providers.disable",
    "providers.configure",
  ],
  fees: ["fees.view", "fees.create", "fees.update", "fees.delete", "fees.activate"],
  kyc: ["kyc.view", "kyc.review", "kyc.approve", "kyc.reject"],
  settlements: [
    "settlements.view",
    "settlements.create",
    "settlements.approve",
    "settlements.export",
  ],
  ledger: ["ledger.view", "ledger.export"],
  reconciliation: ["reconciliation.view", "reconciliation.run", "reconciliation.resolve"],
  reports: ["reports.view", "reports.generate", "reports.export", "reports.schedule"],
  staff: ["staff.view", "staff.create", "staff.update", "staff.suspend", "staff.delete"],
  roles: ["roles.view", "roles.create", "roles.update", "roles.delete", "roles.assign"],
  developer: [
    "developer.view",
    "developer.keys.create",
    "developer.keys.rotate",
    "developer.keys.revoke",
    "developer.logs.view",
  ],
  webhooks: [
    "webhooks.view",
    "webhooks.create",
    "webhooks.update",
    "webhooks.delete",
    "webhooks.retry",
  ],
  system: ["system.settings", "system.audit_logs", "system.notifications", "system.security"],
} as const;

export type PermissionModule = keyof typeof PERMISSIONS;
export type Permission = (typeof PERMISSIONS)[PermissionModule][number];

export const ALL_PERMISSIONS: string[] = Object.values(PERMISSIONS).flat();

/** Human labels for the role builder UI. */
export const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: "Dashboard",
  merchants: "Merchants",
  customers: "Customers",
  transactions: "Transactions",
  payments: "Payments",
  refunds: "Refunds",
  providers: "Providers",
  fees: "Fees",
  kyc: "KYC",
  settlements: "Settlements",
  ledger: "Ledger",
  reconciliation: "Reconciliation",
  reports: "Reports",
  staff: "Staff",
  roles: "Roles",
  developer: "Developer",
  webhooks: "Webhooks",
  system: "System",
};

export function permissionLabel(permission: string): string {
  const action = permission.split(".").slice(1).join(" ");
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Permissions that must never be granted together to the same role without a
 * deliberate override — separation of duties for a financial system.
 *
 * The role builder warns when a combination here is selected; it does not block
 * it, because a small team sometimes has no choice. The warning is what makes
 * the decision conscious and auditable.
 */
export const SEGREGATION_CONFLICTS: {
  a: string;
  b: string;
  reason: string;
}[] = [
  {
    a: "refunds.create",
    b: "refunds.approve",
    reason: "One person could raise and approve a refund to themselves.",
  },
  {
    a: "settlements.create",
    b: "settlements.approve",
    reason: "One person could create and release a payout unchecked.",
  },
  {
    a: "fees.update",
    b: "settlements.approve",
    reason: "Fees could be altered to change what a settlement pays out.",
  },
  {
    a: "staff.create",
    b: "roles.assign",
    reason: "One person could create an account and grant it any permission.",
  },
];

export function findConflicts(selected: string[]): typeof SEGREGATION_CONFLICTS {
  const set = new Set(selected);
  return SEGREGATION_CONFLICTS.filter((c) => set.has(c.a) && set.has(c.b));
}

/**
 * Privileged actions that require a fresh re-authentication (password + MFA)
 * even when the user already holds the permission.
 */
export const STEP_UP_REQUIRED: string[] = [
  "roles.create",
  "roles.update",
  "roles.delete",
  "roles.assign",
  "staff.create",
  "staff.delete",
  "providers.configure",
  "fees.update",
  "settlements.approve",
  "system.settings",
  "system.security",
  "developer.keys.rotate",
  "developer.keys.revoke",
];

export function requiresStepUp(permission: string): boolean {
  return STEP_UP_REQUIRED.includes(permission);
}
