/**
 * Domain types for XerinPay.
 *
 * These mirror the payment-orchestration model: a Transaction may have many
 * PaymentAttempts, each routed to a different provider adapter (Selcom,
 * AzamPay, …) so fallback is a first-class concept rather than a special case.
 */

/* ------------------------------------------------------------------ core */

export type UUID = string;
export type ISODate = string;

/** Minor units (cents). Never use floats for money. */
export type Minor = number;

export type Currency = "TZS" | "KES" | "UGX" | "USD" | "EUR" | (string & {});

export interface Money {
  amount: Minor;
  currency: Currency;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ------------------------------------------------------------------ user */

export type ActorScope = "merchant" | "staff";

export interface Role {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  scope: ActorScope;
  is_system: boolean;
  permissions: string[];
  user_count?: number;
  created_at: ISODate;
}

export interface User {
  id: UUID;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string | null;
  scope: ActorScope;
  is_superuser: boolean;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  mfa_enabled: boolean;
  roles: Role[];
  permissions: string[];
  merchant: MerchantSummary | null;
  last_login: ISODate | null;
  created_at: ISODate;
}

export interface AuthSession {
  id: UUID;
  ip_address: string;
  user_agent: string;
  device: string | null;
  location: string | null;
  is_current: boolean;
  created_at: ISODate;
  last_seen_at: ISODate;
}

/* -------------------------------------------------------------- merchant */

export type MerchantStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACTION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type MerchantMode = "sandbox" | "live";

export interface MerchantSummary {
  id: UUID;
  name: string;
  reference: string;
  status: MerchantStatus;
  mode: MerchantMode;
  logo_url?: string | null;
}

export interface Merchant extends MerchantSummary {
  legal_name: string;
  business_type: string;
  registration_number: string | null;
  tax_id: string | null;
  country: string;
  city: string | null;
  address: string | null;
  website: string | null;
  support_email: string | null;
  support_phone: string | null;
  settlement_currency: Currency;
  settlement_schedule: "daily" | "weekly" | "monthly" | "manual";
  kyc_status: KycStatus;
  created_at: ISODate;
  approved_at: ISODate | null;
}

export interface MerchantBalance {
  available: Money;
  pending: Money;
  settled_total: Money;
  reserved: Money;
}

/* ------------------------------------------------------------------- kyc */

export type KycStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "ACTION_REQUIRED"
  | "APPROVED"
  | "REJECTED";

export interface KycDocument {
  id: UUID;
  document_type: string;
  file_url: string;
  status: KycStatus;
  rejection_reason: string | null;
  uploaded_at: ISODate;
}

export interface KycApplication {
  id: UUID;
  merchant: MerchantSummary;
  status: KycStatus;
  documents: KycDocument[];
  reviewer: string | null;
  notes: string | null;
  submitted_at: ISODate | null;
  reviewed_at: ISODate | null;
}

/* -------------------------------------------------------- payment engine */

export type PaymentStatus =
  | "CREATED"
  | "INITIATED"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type PaymentMethod =
  | "mobile_money"
  | "card"
  | "bank_transfer"
  | "wallet"
  | (string & {});

export interface Provider {
  id: UUID;
  name: string;
  slug: string;
  is_enabled: boolean;
  supported_methods: PaymentMethod[];
  country: string;
  success_rate: number | null;
  avg_latency_ms: number | null;
  status: "healthy" | "degraded" | "down" | "unknown";
  created_at: ISODate;
}

export interface PaymentAttempt {
  id: UUID;
  sequence: number;
  provider: Pick<Provider, "id" | "name" | "slug">;
  status: PaymentStatus;
  provider_reference: string | null;
  error_code: string | null;
  error_message: string | null;
  latency_ms: number | null;
  created_at: ISODate;
  completed_at: ISODate | null;
}

export interface Transaction {
  id: UUID;
  reference: string;
  merchant: MerchantSummary;
  customer: CustomerSummary | null;
  amount: Minor;
  currency: Currency;
  fee: Minor;
  net_amount: Minor;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  provider: Pick<Provider, "id" | "name" | "slug"> | null;
  attempts_count: number;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: ISODate;
  completed_at: ISODate | null;
}

export interface CustomerSummary {
  id: UUID;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Customer extends CustomerSummary {
  merchant: MerchantSummary;
  transaction_count: number;
  total_spent: Minor;
  currency: Currency;
  created_at: ISODate;
}

export interface PaymentLink {
  id: UUID;
  reference: string;
  title: string;
  url: string;
  amount: Minor | null;
  currency: Currency;
  is_active: boolean;
  is_reusable: boolean;
  expires_at: ISODate | null;
  payments_count: number;
  created_at: ISODate;
}

/* --------------------------------------------------------------- refunds */

export type RefundStatus =
  | "REQUESTED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface Refund {
  id: UUID;
  reference: string;
  transaction: Pick<Transaction, "id" | "reference" | "amount" | "currency">;
  merchant: MerchantSummary;
  amount: Minor;
  currency: Currency;
  reason: string;
  status: RefundStatus;
  requested_by: string | null;
  approved_by: string | null;
  created_at: ISODate;
  completed_at: ISODate | null;
}

/* ------------------------------------------------------------------ fees */

export type FeeMode =
  | "percentage"
  | "fixed"
  | "percentage_plus_fixed";

export type FeeBearer = "merchant" | "customer" | "split";

export type FeeScope = "global" | "provider" | "payment_method" | "merchant";

export interface FeeRule {
  id: UUID;
  name: string;
  scope: FeeScope;
  provider: Pick<Provider, "id" | "name"> | null;
  merchant: MerchantSummary | null;
  payment_method: PaymentMethod | null;
  mode: FeeMode;
  percentage: string | null;
  fixed_amount: Minor | null;
  bearer: FeeBearer;
  min_fee: Minor | null;
  max_fee: Minor | null;
  currency: Currency;
  priority: number;
  is_active: boolean;
  created_at: ISODate;
}

/* ----------------------------------------------------------- settlements */

export type SettlementStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

export interface Settlement {
  id: UUID;
  reference: string;
  merchant: MerchantSummary;
  gross_amount: Minor;
  fee_amount: Minor;
  refund_amount: Minor;
  net_amount: Minor;
  currency: Currency;
  status: SettlementStatus;
  items_count: number;
  period_start: ISODate;
  period_end: ISODate;
  approved_by: string | null;
  created_at: ISODate;
  completed_at: ISODate | null;
}

/* ---------------------------------------------------------------- ledger */

export type LedgerDirection = "debit" | "credit";

export interface LedgerAccount {
  id: UUID;
  name: string;
  code: string;
  type: "asset" | "liability" | "revenue" | "expense" | "equity";
  balance: Minor;
  currency: Currency;
}

export interface LedgerEntry {
  id: UUID;
  account: Pick<LedgerAccount, "id" | "name" | "code">;
  direction: LedgerDirection;
  amount: Minor;
  currency: Currency;
  reference: string;
  description: string;
  transaction_id: UUID | null;
  created_at: ISODate;
}

/* -------------------------------------------------------- reconciliation */

export type ReconStatus =
  | "MATCHED"
  | "MISSING_PROVIDER"
  | "MISSING_XERINPAY"
  | "AMOUNT_MISMATCH"
  | "STATUS_MISMATCH"
  | "DUPLICATE";

export interface ReconciliationRecord {
  id: UUID;
  provider: Pick<Provider, "id" | "name" | "slug">;
  status: ReconStatus;
  our_reference: string | null;
  provider_reference: string | null;
  our_amount: Minor | null;
  provider_amount: Minor | null;
  currency: Currency;
  resolved: boolean;
  resolved_by: string | null;
  notes: string | null;
  run_date: ISODate;
  created_at: ISODate;
}

/* -------------------------------------------------------------- webhooks */

export interface WebhookEndpoint {
  id: UUID;
  url: string;
  description: string | null;
  events: string[];
  is_active: boolean;
  secret_preview: string;
  success_rate: number | null;
  created_at: ISODate;
}

export type DeliveryStatus = "pending" | "delivered" | "failed" | "retrying";

export interface WebhookDelivery {
  id: UUID;
  endpoint_id: UUID;
  event: string;
  status: DeliveryStatus;
  http_status: number | null;
  attempts: number;
  response_time_ms: number | null;
  error: string | null;
  payload: Record<string, unknown>;
  created_at: ISODate;
  last_attempt_at: ISODate | null;
}

/* ------------------------------------------------------------- developer */

export type KeyEnvironment = "sandbox" | "live";

export interface ApiKey {
  id: UUID;
  name: string;
  environment: KeyEnvironment;
  prefix: string;
  /** Only ever returned once, at creation or rotation. */
  secret?: string;
  last_used_at: ISODate | null;
  is_active: boolean;
  created_by: string | null;
  created_at: ISODate;
}

export interface ApiLog {
  id: UUID;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  ip_address: string;
  api_key_prefix: string | null;
  created_at: ISODate;
}

/* ----------------------------------------------------------------- audit */

export interface AuditLog {
  id: UUID;
  actor: string;
  actor_id: UUID | null;
  action: string;
  module: string;
  object_type: string | null;
  object_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: ISODate;
}

/* -------------------------------------------------------------- reports */

export interface OverviewMetrics {
  total_processed: Money;
  today_volume: Money;
  platform_revenue: Money;
  successful_count: number;
  failed_count: number;
  pending_count: number;
  success_rate: number;
  /** Percentage change vs the previous comparable period. */
  deltas?: Partial<Record<string, number>>;
}

export interface TimeSeriesPoint {
  date: ISODate;
  volume: Minor;
  count: number;
  success_count?: number;
  failed_count?: number;
  revenue?: Minor;
}

export interface ProviderPerformance {
  provider: Pick<Provider, "id" | "name" | "slug">;
  volume: Minor;
  count: number;
  success_rate: number;
  failed_count: number;
  avg_latency_ms: number | null;
}

export interface PlatformAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  href?: string;
  created_at: ISODate;
}

/* --------------------------------------------------------- notifications */

export interface AppNotification {
  id: UUID;
  title: string;
  body: string;
  category: string;
  is_read: boolean;
  href: string | null;
  created_at: ISODate;
}
