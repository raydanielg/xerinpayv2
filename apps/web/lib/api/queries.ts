"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, api } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  ApiKey,
  ApiLog,
  AuditLog,
  AppNotification,
  Customer,
  FeeRule,
  KycApplication,
  LedgerAccount,
  LedgerEntry,
  Merchant,
  MerchantBalance,
  OverviewMetrics,
  Paginated,
  PaymentLink,
  PlatformAlert,
  Provider,
  ProviderPerformance,
  ReconciliationRecord,
  Refund,
  Role,
  Settlement,
  TimeSeriesPoint,
  Transaction,
  User,
  WebhookDelivery,
  WebhookEndpoint,
} from "@/lib/api/types";

/* ------------------------------------------------------------------ keys */

export const qk = {
  overview: (params?: unknown) => ["overview", params] as const,
  series: (params?: unknown) => ["series", params] as const,
  alerts: () => ["alerts"] as const,
  providerPerf: (params?: unknown) => ["provider-performance", params] as const,

  transactions: (params?: unknown) => ["transactions", params] as const,
  transaction: (id: string) => ["transaction", id] as const,
  attempts: (id: string) => ["transaction-attempts", id] as const,

  merchants: (params?: unknown) => ["merchants", params] as const,
  merchant: (id: string) => ["merchant", id] as const,
  balance: () => ["balance"] as const,

  customers: (params?: unknown) => ["customers", params] as const,
  refunds: (params?: unknown) => ["refunds", params] as const,
  settlements: (params?: unknown) => ["settlements", params] as const,
  paymentLinks: (params?: unknown) => ["payment-links", params] as const,

  providers: (params?: unknown) => ["providers", params] as const,
  routingRules: () => ["routing-rules"] as const,
  fees: (params?: unknown) => ["fees", params] as const,

  ledgerAccounts: () => ["ledger-accounts"] as const,
  ledgerEntries: (params?: unknown) => ["ledger-entries", params] as const,
  reconciliation: (params?: unknown) => ["reconciliation", params] as const,

  kyc: (params?: unknown) => ["kyc", params] as const,
  staff: (params?: unknown) => ["staff", params] as const,
  roles: () => ["roles"] as const,
  permissions: () => ["permission-catalog"] as const,

  apiKeys: (params?: unknown) => ["api-keys", params] as const,
  apiLogs: (params?: unknown) => ["api-logs", params] as const,
  webhookEndpoints: () => ["webhook-endpoints"] as const,
  webhookDeliveries: (params?: unknown) => ["webhook-deliveries", params] as const,

  audit: (params?: unknown) => ["audit", params] as const,
  notifications: () => ["notifications"] as const,
};

export type ListParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/* ---------------------------------------------------------------- helper */

/** Generic paginated list hook — every table in the app is built on this. */
function useList<T>(
  key: readonly unknown[],
  path: string,
  params?: ListParams,
  options?: Partial<UseQueryOptions<Paginated<T>, ApiError>>,
) {
  return useQuery<Paginated<T>, ApiError>({
    queryKey: key,
    queryFn: () => api.get<Paginated<T>>(path, { query: params }),
    placeholderData: (previous) => previous, // keeps the table stable while paging
    ...options,
  });
}

function useDetail<T>(
  key: readonly unknown[],
  path: string,
  enabled = true,
  options?: Partial<UseQueryOptions<T, ApiError>>,
) {
  return useQuery<T, ApiError>({
    queryKey: key,
    queryFn: () => api.get<T>(path),
    enabled,
    ...options,
  });
}

/** Shared mutation wrapper: toasts on both outcomes, invalidates on success. */
function useAction<TVars, TData = unknown>(
  mutationFn: (vars: TVars) => Promise<TData>,
  {
    successMessage,
    invalidate = [],
  }: { successMessage?: string; invalidate?: readonly unknown[][] } = {},
) {
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVars>({
    mutationFn,
    onSuccess: () => {
      if (successMessage) toast.success(successMessage);
      for (const key of invalidate) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
    onError: (error) => {
      toast.error(error.detail);
    },
  });
}

/* -------------------------------------------------------------- overview */

export function useOverview(params?: ListParams) {
  return useQuery<OverviewMetrics, ApiError>({
    queryKey: qk.overview(params),
    queryFn: () => api.get<OverviewMetrics>(endpoints.reports.overview, { query: params }),
    refetchInterval: 60_000,
  });
}

export function useVolumeSeries(params?: ListParams) {
  return useQuery<TimeSeriesPoint[], ApiError>({
    queryKey: qk.series(params),
    queryFn: async () => {
      const data = await api.get<TimeSeriesPoint[] | Paginated<TimeSeriesPoint>>(
        endpoints.reports.transactions,
        { query: params },
      );
      return Array.isArray(data) ? data : data.results;
    },
  });
}

export function usePlatformAlerts() {
  return useQuery<PlatformAlert[], ApiError>({
    queryKey: qk.alerts(),
    queryFn: async () => {
      const data = await api.get<PlatformAlert[] | Paginated<PlatformAlert>>(
        endpoints.notifications.list,
        { query: { category: "alert", is_read: false } },
      );
      return Array.isArray(data) ? data : data.results;
    },
    refetchInterval: 120_000,
  });
}

export function useProviderPerformance(params?: ListParams) {
  return useQuery<ProviderPerformance[], ApiError>({
    queryKey: qk.providerPerf(params),
    queryFn: async () => {
      const data = await api.get<ProviderPerformance[] | Paginated<ProviderPerformance>>(
        endpoints.reports.providers,
        { query: params },
      );
      return Array.isArray(data) ? data : data.results;
    },
  });
}

/* ---------------------------------------------------------- transactions */

export const useTransactions = (params?: ListParams) =>
  useList<Transaction>(qk.transactions(params), endpoints.transactions.list, params);

export const useTransaction = (id: string) =>
  useDetail<Transaction>(qk.transaction(id), endpoints.transactions.detail(id), Boolean(id));

export const useTransactionAttempts = (id: string) =>
  useDetail<Paginated<import("@/lib/api/types").PaymentAttempt>>(
    qk.attempts(id),
    endpoints.transactions.attempts(id),
    Boolean(id),
  );

export const useRetryPayment = () =>
  useAction<string>((id) => api.post(endpoints.payments.retry(id)), {
    successMessage: "Retry queued",
    invalidate: [qk.transactions(), ["transaction"]],
  });

/* --------------------------------------------------------------- refunds */

export const useRefunds = (params?: ListParams) =>
  useList<Refund>(qk.refunds(params), endpoints.refunds.list, params);

export const useCreateRefund = () =>
  useAction<{ transaction: string; amount: number; reason: string }>(
    (body) => api.post(endpoints.refunds.create, body),
    { successMessage: "Refund requested", invalidate: [qk.refunds(), qk.transactions()] },
  );

export const useApproveRefund = () =>
  useAction<string>((id) => api.post(endpoints.refunds.approve(id)), {
    successMessage: "Refund approved",
    invalidate: [qk.refunds()],
  });

export const useRejectRefund = () =>
  useAction<{ id: string; reason: string }>(
    ({ id, reason }) => api.post(endpoints.refunds.reject(id), { reason }),
    { successMessage: "Refund rejected", invalidate: [qk.refunds()] },
  );

/* ------------------------------------------------------------- merchants */

export const useMerchants = (params?: ListParams) =>
  useList<Merchant>(qk.merchants(params), endpoints.merchants.list, params);

export const useMerchant = (id: string) =>
  useDetail<Merchant>(qk.merchant(id), endpoints.merchants.detail(id), Boolean(id));

export const useMerchantBalance = () =>
  useDetail<MerchantBalance>(qk.balance(), endpoints.merchants.balance);

export const useSuspendMerchant = () =>
  useAction<{ id: string; reason: string }>(
    ({ id, reason }) => api.post(endpoints.merchants.suspend(id), { reason }),
    { successMessage: "Merchant suspended", invalidate: [qk.merchants(), ["merchant"]] },
  );

export const useActivateMerchant = () =>
  useAction<string>((id) => api.post(endpoints.merchants.activate(id)), {
    successMessage: "Merchant activated",
    invalidate: [qk.merchants(), ["merchant"]],
  });

/* ------------------------------------------------------------- customers */

export const useCustomers = (params?: ListParams) =>
  useList<Customer>(qk.customers(params), endpoints.customers.list, params);

/* --------------------------------------------------------- payment links */

export const usePaymentLinks = (params?: ListParams) =>
  useList<PaymentLink>(qk.paymentLinks(params), endpoints.payments.links, params);

export const useCreatePaymentLink = () =>
  useAction<Record<string, unknown>>((body) => api.post(endpoints.payments.links, body), {
    successMessage: "Payment link created",
    invalidate: [qk.paymentLinks()],
  });

/* ----------------------------------------------------------- settlements */

export const useSettlements = (params?: ListParams) =>
  useList<Settlement>(qk.settlements(params), endpoints.settlements.list, params);

export const useApproveSettlement = () =>
  useAction<string>((id) => api.post(endpoints.settlements.approve(id)), {
    successMessage: "Settlement approved",
    invalidate: [qk.settlements()],
  });

/* ------------------------------------------------------------- providers */

export const useProviders = (params?: ListParams) =>
  useList<Provider>(qk.providers(params), endpoints.providers.list, params);

export const useToggleProvider = () =>
  useAction<{ id: string; enable: boolean }>(
    ({ id, enable }) =>
      api.post(enable ? endpoints.providers.enable(id) : endpoints.providers.disable(id)),
    { successMessage: "Provider updated", invalidate: [qk.providers()] },
  );

export const useRoutingRules = () =>
  useDetail<Paginated<Record<string, unknown>>>(
    qk.routingRules(),
    endpoints.providers.routingRules,
  );

/* ------------------------------------------------------------------ fees */

export const useFeeRules = (params?: ListParams) =>
  useList<FeeRule>(qk.fees(params), endpoints.fees.rules, params);

export const useSaveFeeRule = () =>
  useAction<{ id?: string; data: Record<string, unknown> }>(
    ({ id, data }) =>
      id ? api.patch(endpoints.fees.rule(id), data) : api.post(endpoints.fees.rules, data),
    { successMessage: "Fee rule saved", invalidate: [qk.fees()] },
  );

/* ---------------------------------------------------------------- ledger */

export const useLedgerAccounts = () =>
  useDetail<Paginated<LedgerAccount>>(qk.ledgerAccounts(), endpoints.ledger.accounts);

export const useLedgerEntries = (params?: ListParams) =>
  useList<LedgerEntry>(qk.ledgerEntries(params), endpoints.ledger.entries, params);

/* -------------------------------------------------------- reconciliation */

export const useReconciliation = (params?: ListParams) =>
  useList<ReconciliationRecord>(qk.reconciliation(params), endpoints.reconciliation.list, params);

export const useRunReconciliation = () =>
  useAction<Record<string, unknown> | void>(
    (body) => api.post(endpoints.reconciliation.run, body ?? {}),
    { successMessage: "Reconciliation started", invalidate: [qk.reconciliation()] },
  );

export const useResolveRecon = () =>
  useAction<{ id: string; notes: string }>(
    ({ id, notes }) => api.post(endpoints.reconciliation.resolve(id), { notes }),
    { successMessage: "Marked as resolved", invalidate: [qk.reconciliation()] },
  );

/* ------------------------------------------------------------------- kyc */

export const useKycApplications = (params?: ListParams) =>
  useList<KycApplication>(qk.kyc(params), endpoints.kyc.list, params);

export const useApproveKyc = () =>
  useAction<string>((id) => api.post(endpoints.kyc.approve(id)), {
    successMessage: "KYC approved",
    invalidate: [qk.kyc(), qk.merchants()],
  });

export const useRejectKyc = () =>
  useAction<{ id: string; reason: string }>(
    ({ id, reason }) => api.post(endpoints.kyc.reject(id), { reason }),
    { successMessage: "KYC rejected", invalidate: [qk.kyc()] },
  );

/* ------------------------------------------------------------ staff/rbac */

export const useStaff = (params?: ListParams) =>
  useList<User>(qk.staff(params), endpoints.staff.list, params);

export const useRoles = () => useDetail<Paginated<Role>>(qk.roles(), endpoints.rbac.roles);

export const usePermissionCatalog = () =>
  useDetail<string[] | Paginated<{ code: string }>>(
    qk.permissions(),
    endpoints.rbac.permissions,
  );

export const useSaveRole = () =>
  useAction<{ id?: string; data: Record<string, unknown> }>(
    ({ id, data }) =>
      id ? api.patch(endpoints.rbac.role(id), data) : api.post(endpoints.rbac.roles, data),
    { successMessage: "Role saved", invalidate: [qk.roles()] },
  );

export const useDeleteRole = () =>
  useAction<string>((id) => api.delete(endpoints.rbac.role(id)), {
    successMessage: "Role deleted",
    invalidate: [qk.roles()],
  });

export const useInviteStaff = () =>
  useAction<Record<string, unknown>>((body) => api.post(endpoints.staff.invite, body), {
    successMessage: "Invitation sent",
    invalidate: [qk.staff()],
  });

/* ------------------------------------------------------------- developer */

export const useApiKeys = (params?: ListParams) =>
  useList<ApiKey>(qk.apiKeys(params), endpoints.developer.keys, params);

export const useCreateApiKey = () =>
  useAction<{ name: string; environment: string }, ApiKey>(
    (body) => api.post<ApiKey>(endpoints.developer.keys, body),
    { invalidate: [qk.apiKeys()] },
  );

export const useRevokeApiKey = () =>
  useAction<string>((id) => api.post(endpoints.developer.revokeKey(id)), {
    successMessage: "Key revoked",
    invalidate: [qk.apiKeys()],
  });

export const useApiLogs = (params?: ListParams) =>
  useList<ApiLog>(qk.apiLogs(params), endpoints.developer.logs, params);

/* -------------------------------------------------------------- webhooks */

export const useWebhookEndpoints = () =>
  useDetail<Paginated<WebhookEndpoint>>(qk.webhookEndpoints(), endpoints.webhooks.endpoints);

export const useWebhookDeliveries = (params?: ListParams) =>
  useList<WebhookDelivery>(qk.webhookDeliveries(params), endpoints.webhooks.deliveries, params);

export const useRetryDelivery = () =>
  useAction<string>((id) => api.post(endpoints.webhooks.retry(id)), {
    successMessage: "Delivery retried",
    invalidate: [qk.webhookDeliveries()],
  });

export const useSaveWebhookEndpoint = () =>
  useAction<{ id?: string; data: Record<string, unknown> }>(
    ({ id, data }) =>
      id
        ? api.patch(endpoints.webhooks.endpoint(id), data)
        : api.post(endpoints.webhooks.endpoints, data),
    { successMessage: "Endpoint saved", invalidate: [qk.webhookEndpoints()] },
  );

/* ----------------------------------------------------------------- audit */

export const useAuditLogs = (params?: ListParams) =>
  useList<AuditLog>(qk.audit(params), endpoints.audit.logs, params);

/* --------------------------------------------------------- notifications */

export const useNotifications = () =>
  useDetail<Paginated<AppNotification>>(qk.notifications(), endpoints.notifications.list, true, {
    refetchInterval: 60_000,
  });

export const useMarkAllRead = () =>
  useAction<void>(() => api.post(endpoints.notifications.markAllRead), {
    invalidate: [qk.notifications()],
  });
