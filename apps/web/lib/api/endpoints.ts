/**
 * ---------------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH FOR EVERY BACKEND PATH
 * ---------------------------------------------------------------------------
 *
 * Nothing else in the frontend hard-codes a Django URL. If your DRF routes
 * differ from what is written here, fix them IN THIS FILE ONLY — every page,
 * hook, and component reads from these constants.
 *
 * Paths are relative to `API_BASE_URL` (see .env.local.example) and are sent
 * through the server-side proxy at /api/proxy/<path>, so the browser never
 * sees an access token.
 */

const V1 = "/api/v1";

export const endpoints = {
  /* ---------------------------------------------------------------- auth */
  auth: {
    login: `${V1}/auth/login/`,
    logout: `${V1}/auth/logout/`,
    refresh: `${V1}/auth/token/refresh/`,
    register: `${V1}/auth/register/`,
    me: `${V1}/auth/me/`,
    verifyEmail: `${V1}/auth/verify-email/`,
    resendVerification: `${V1}/auth/resend-verification/`,
    verifyPhone: `${V1}/auth/verify-phone/`,
    forgotPassword: `${V1}/auth/password/forgot/`,
    resetPassword: `${V1}/auth/password/reset/`,
    changePassword: `${V1}/auth/password/change/`,
    mfaChallenge: `${V1}/auth/mfa/challenge/`,
    mfaVerify: `${V1}/auth/mfa/verify/`,
    mfaEnroll: `${V1}/auth/mfa/enroll/`,
    mfaDisable: `${V1}/auth/mfa/disable/`,
    mfaRecoveryCodes: `${V1}/auth/mfa/recovery-codes/`,
    sessions: `${V1}/auth/sessions/`,
    session: (id: string) => `${V1}/auth/sessions/${id}/`,
  },

  /* ---------------------------------------------------------------- rbac */
  rbac: {
    roles: `${V1}/rbac/roles/`,
    role: (id: string) => `${V1}/rbac/roles/${id}/`,
    permissions: `${V1}/rbac/permissions/`,
    assignRole: `${V1}/rbac/assign/`,
    myPermissions: `${V1}/rbac/me/permissions/`,
  },

  /* ----------------------------------------------------------- merchants */
  merchants: {
    list: `${V1}/merchants/`,
    detail: (id: string) => `${V1}/merchants/${id}/`,
    suspend: (id: string) => `${V1}/merchants/${id}/suspend/`,
    activate: (id: string) => `${V1}/merchants/${id}/activate/`,
    verify: (id: string) => `${V1}/merchants/${id}/verify/`,
    settings: (id: string) => `${V1}/merchants/${id}/settings/`,
    team: (id: string) => `${V1}/merchants/${id}/users/`,
    current: `${V1}/merchants/current/`,
    balance: `${V1}/merchants/current/balance/`,
  },

  /* ------------------------------------------------------------ customers */
  customers: {
    list: `${V1}/customers/`,
    detail: (id: string) => `${V1}/customers/${id}/`,
  },

  /* ------------------------------------------------------------------ kyc */
  kyc: {
    list: `${V1}/kyc/`,
    detail: (id: string) => `${V1}/kyc/${id}/`,
    submit: `${V1}/kyc/submit/`,
    documents: `${V1}/kyc/documents/`,
    approve: (id: string) => `${V1}/kyc/${id}/approve/`,
    reject: (id: string) => `${V1}/kyc/${id}/reject/`,
    requestAction: (id: string) => `${V1}/kyc/${id}/request-action/`,
  },

  /* ------------------------------------------------------------- payments */
  payments: {
    list: `${V1}/payments/`,
    detail: (id: string) => `${V1}/payments/${id}/`,
    create: `${V1}/payments/`,
    retry: (id: string) => `${V1}/payments/${id}/retry/`,
    cancel: (id: string) => `${V1}/payments/${id}/cancel/`,
    attempts: (id: string) => `${V1}/payments/${id}/attempts/`,
    links: `${V1}/payments/links/`,
    link: (id: string) => `${V1}/payments/links/${id}/`,
  },

  /* --------------------------------------------------------- transactions */
  transactions: {
    list: `${V1}/transactions/`,
    detail: (id: string) => `${V1}/transactions/${id}/`,
    export: `${V1}/transactions/export/`,
    attempts: (id: string) => `${V1}/transactions/${id}/attempts/`,
  },

  /* -------------------------------------------------------------- refunds */
  refunds: {
    list: `${V1}/refunds/`,
    detail: (id: string) => `${V1}/refunds/${id}/`,
    create: `${V1}/refunds/`,
    approve: (id: string) => `${V1}/refunds/${id}/approve/`,
    reject: (id: string) => `${V1}/refunds/${id}/reject/`,
  },

  /* ------------------------------------------------------------ providers */
  providers: {
    list: `${V1}/providers/`,
    detail: (id: string) => `${V1}/providers/${id}/`,
    enable: (id: string) => `${V1}/providers/${id}/enable/`,
    disable: (id: string) => `${V1}/providers/${id}/disable/`,
    accounts: `${V1}/providers/accounts/`,
    routingRules: `${V1}/providers/routing-rules/`,
    routingRule: (id: string) => `${V1}/providers/routing-rules/${id}/`,
    logs: `${V1}/providers/logs/`,
    health: `${V1}/providers/health/`,
  },

  /* ----------------------------------------------------------------- fees */
  fees: {
    list: `${V1}/fees/`,
    detail: (id: string) => `${V1}/fees/${id}/`,
    rules: `${V1}/fees/rules/`,
    rule: (id: string) => `${V1}/fees/rules/${id}/`,
    activate: (id: string) => `${V1}/fees/${id}/activate/`,
    preview: `${V1}/fees/preview/`,
  },

  /* ---------------------------------------------------------- settlements */
  settlements: {
    list: `${V1}/settlements/`,
    detail: (id: string) => `${V1}/settlements/${id}/`,
    create: `${V1}/settlements/`,
    approve: (id: string) => `${V1}/settlements/${id}/approve/`,
    items: (id: string) => `${V1}/settlements/${id}/items/`,
    export: `${V1}/settlements/export/`,
  },

  /* --------------------------------------------------------------- ledger */
  ledger: {
    accounts: `${V1}/ledger/accounts/`,
    entries: `${V1}/ledger/entries/`,
    balance: `${V1}/ledger/balance/`,
  },

  /* ------------------------------------------------------- reconciliation */
  reconciliation: {
    list: `${V1}/reconciliation/`,
    detail: (id: string) => `${V1}/reconciliation/${id}/`,
    run: `${V1}/reconciliation/run/`,
    resolve: (id: string) => `${V1}/reconciliation/${id}/resolve/`,
  },

  /* -------------------------------------------------------------- reports */
  reports: {
    overview: `${V1}/reports/overview/`,
    transactions: `${V1}/reports/transactions/`,
    revenue: `${V1}/reports/revenue/`,
    fees: `${V1}/reports/fees/`,
    settlements: `${V1}/reports/settlements/`,
    providers: `${V1}/reports/providers/`,
    merchants: `${V1}/reports/merchants/`,
    export: `${V1}/reports/export/`,
  },

  /* ------------------------------------------------------------- webhooks */
  webhooks: {
    endpoints: `${V1}/webhooks/endpoints/`,
    endpoint: (id: string) => `${V1}/webhooks/endpoints/${id}/`,
    deliveries: `${V1}/webhooks/deliveries/`,
    delivery: (id: string) => `${V1}/webhooks/deliveries/${id}/`,
    retry: (id: string) => `${V1}/webhooks/deliveries/${id}/retry/`,
    test: (id: string) => `${V1}/webhooks/endpoints/${id}/test/`,
  },

  /* ------------------------------------------------------------ developer */
  developer: {
    apps: `${V1}/developer/apps/`,
    app: (id: string) => `${V1}/developer/apps/${id}/`,
    keys: `${V1}/developer/keys/`,
    key: (id: string) => `${V1}/developer/keys/${id}/`,
    rotateKey: (id: string) => `${V1}/developer/keys/${id}/rotate/`,
    revokeKey: (id: string) => `${V1}/developer/keys/${id}/revoke/`,
    logs: `${V1}/developer/logs/`,
  },

  /* ---------------------------------------------------------------- staff */
  staff: {
    list: `${V1}/staff/`,
    detail: (id: string) => `${V1}/staff/${id}/`,
    invite: `${V1}/staff/invite/`,
    suspend: (id: string) => `${V1}/staff/${id}/suspend/`,
    activity: `${V1}/staff/activity/`,
  },

  /* ---------------------------------------------------------------- audit */
  audit: {
    logs: `${V1}/audit/logs/`,
    log: (id: string) => `${V1}/audit/logs/${id}/`,
    export: `${V1}/audit/export/`,
  },

  /* -------------------------------------------------------- notifications */
  notifications: {
    list: `${V1}/notifications/`,
    markRead: (id: string) => `${V1}/notifications/${id}/read/`,
    markAllRead: `${V1}/notifications/read-all/`,
    preferences: `${V1}/notifications/preferences/`,
  },

  /* --------------------------------------------------------------- system */
  system: {
    settings: `${V1}/system/settings/`,
    health: `${V1}/health/`,
  },
} as const;

export type Endpoints = typeof endpoints;
