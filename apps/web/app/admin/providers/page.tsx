"use client";

import * as React from "react";
import { Blocks, Settings2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Switch } from "@workspace/ui/components/switch";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useProviders, useToggleProvider } from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
import { formatPercent } from "@/lib/format";

/**
 * Providers are adapters, not integrations baked into the payment flow.
 * Disabling one here takes it out of routing without a deploy — which is the
 * whole point of keeping Selcom, AzamPay and the rest behind one interface.
 */
export default function ProvidersPage() {
  const { data, isLoading, error, refetch } = useProviders({ page_size: 100 });
  const toggle = useToggleProvider();

  const providers = data?.results ?? [];

  return (
    <>
      <PageHeader
        title="Providers"
        description="Payment engines behind XerinPay. Turning one off removes it from routing immediately."
        actions={
          <Can I="providers.configure">
            <Button variant="outline" asChild>
              <a href="/admin/providers/routing">
                <Settings2 className="size-4" />
                Routing rules
              </a>
            </Button>
          </Can>
        }
      />

      {error ? (
        <ErrorState status={error.status} message={error.detail} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          icon={Blocks}
          title="No providers configured"
          description="Add a provider adapter to start routing payments."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="gap-0 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold tracking-tight">
                    {provider.name}
                  </h2>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {provider.slug} · {provider.country}
                  </p>
                </div>
                <Can
                  I="providers.enable"
                  fallback={<StatusBadge status={provider.status} size="sm" />}
                >
                  <Switch
                    checked={provider.is_enabled}
                    disabled={toggle.isPending}
                    onCheckedChange={(checked) =>
                      toggle.mutate({ id: provider.id, enable: checked })
                    }
                    aria-label={`${provider.is_enabled ? "Disable" : "Enable"} ${provider.name}`}
                  />
                </Can>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {provider.supported_methods?.map((method) => (
                  <span
                    key={method}
                    className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground"
                  >
                    {method.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4 text-center">
                <div>
                  <dt className="text-xs text-muted-foreground">Health</dt>
                  <dd className="mt-1">
                    <StatusBadge status={provider.status} size="sm" />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Success</dt>
                  <dd className="mt-1 text-sm font-medium tabular-nums">
                    {formatPercent(provider.success_rate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Latency</dt>
                  <dd className="mt-1 text-sm font-medium tabular-nums">
                    {provider.avg_latency_ms !== null
                      ? `${provider.avg_latency_ms}ms`
                      : "—"}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
