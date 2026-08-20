"use client";

import * as React from "react";
import { Check, ExternalLink, FileText, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Textarea } from "@workspace/ui/components/textarea";

import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useApproveKyc, useKycApplications, useRejectKyc } from "@/lib/api/queries";
import { Can } from "@/lib/rbac/use-permissions";
import { formatDate } from "@/lib/format";
import type { KycApplication } from "@/lib/api/types";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ACTION_REQUIRED", label: "Action required" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function KycQueuePage() {
  const [status, setStatus] = React.useState("UNDER_REVIEW");
  const { data, isLoading, error, refetch } = useKycApplications({
    status: status || undefined,
    page_size: 50,
    ordering: "submitted_at",
  });

  const approve = useApproveKyc();
  const reject = useRejectKyc();
  const [rejecting, setRejecting] = React.useState<KycApplication | null>(null);
  const [reason, setReason] = React.useState("");

  const applications = data?.results ?? [];

  return (
    <>
      <PageHeader
        title="KYC queue"
        description="Verify business documents before a merchant can take live payments."
        actions={
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
        }
      />

      {error ? (
        <ErrorState status={error.status} message={error.detail} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Queue is clear"
          description="No applications waiting in this state."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="gap-0 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold tracking-tight">
                    {application.merchant?.name ?? "Unknown merchant"}
                  </h2>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {application.merchant?.reference}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {application.documents?.length ? (
                  application.documents.map((document) => (
                    <a
                      key={document.id}
                      href={document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 rounded-lg border border-border/60 p-3 text-sm transition-colors hover:border-border hover:bg-muted/40"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate capitalize">
                        {document.document_type.replace(/_/g, " ")}
                      </span>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDate(application.submitted_at, "time")}
                  {application.reviewer ? ` · Reviewer ${application.reviewer}` : ""}
                </p>

                {application.status !== "APPROVED" &&
                application.status !== "REJECTED" ? (
                  <div className="flex gap-2">
                    <Can I="kyc.reject">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          setRejecting(application);
                          setReason("");
                        }}
                      >
                        <X className="size-4" />
                        Reject
                      </Button>
                    </Can>
                    <Can I="kyc.approve">
                      <Button
                        size="sm"
                        disabled={approve.isPending}
                        onClick={() => approve.mutate(application.id)}
                      >
                        <Check className="size-4" />
                        Approve
                      </Button>
                    </Can>
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => !open && setRejecting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this application?</AlertDialogTitle>
            <AlertDialogDescription>
              The merchant sees this reason and can resubmit corrected documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Certificate of incorporation is illegible; please upload a clearer scan."
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={reason.trim().length < 8 || reject.isPending}
              onClick={() => {
                if (!rejecting) return;
                reject.mutate(
                  { id: rejecting.id, reason: reason.trim() },
                  { onSuccess: () => setRejecting(null) },
                );
              }}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
