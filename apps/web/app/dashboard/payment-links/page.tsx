"use client";

import * as React from "react";
import { Check, Copy, Link2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";

import { Column, DataTable, useTableState } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useCreatePaymentLink, usePaymentLinks } from "@/lib/api/queries";
import { decimalsFor, formatDate, formatMoney, formatNumber } from "@/lib/format";
import type { PaymentLink } from "@/lib/api/types";

const PAGE_SIZE = 25;

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Could not copy");
        }
      }}
    >
      {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
      Copy
    </Button>
  );
}

export default function PaymentLinksPage() {
  const { page, setPage, search, setSearch, debounced } = useTableState();
  const query = usePaymentLinks({
    page,
    page_size: PAGE_SIZE,
    search: debounced || undefined,
    ordering: "-created_at",
  });

  const create = useCreatePaymentLink();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [reusable, setReusable] = React.useState(true);

  const columns: Column<PaymentLink>[] = [
    {
      id: "title",
      header: "Link",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.title}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{row.url}</p>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      cell: (row) =>
        row.amount === null ? (
          <span className="text-muted-foreground">Customer chooses</span>
        ) : (
          <span className="font-medium tabular-nums">
            {formatMoney(row.amount, row.currency)}
          </span>
        ),
    },
    {
      id: "payments",
      header: "Payments",
      align: "right",
      secondary: true,
      cell: (row) => (
        <span className="tabular-nums">{formatNumber(row.payments_count)}</span>
      ),
    },
    {
      id: "expires",
      header: "Expires",
      secondary: true,
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.expires_at ? formatDate(row.expires_at) : "Never"}
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (row) =>
        row.is_active ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      cell: (row) => <CopyLink url={row.url} />,
    },
  ];

  const parsed = Number(amount);
  const validAmount = amount === "" || (Number.isFinite(parsed) && parsed > 0);

  return (
    <>
      <PageHeader
        title="Payment links"
        description="Take a payment without writing any code — share a link on WhatsApp, email, or a poster."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            New link
          </Button>
        }
      />

      <DataTable
        columns={columns}
        query={query}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Link title…"
        rowKey={(row) => row.id}
        emptyTitle="No payment links yet"
        emptyDescription="Create one and share it — no integration required."
        emptyAction={
          <Button onClick={() => setOpen(true)}>
            <Link2 className="size-4" />
            Create a link
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New payment link</DialogTitle>
            <DialogDescription>
              Leave the amount empty to let the customer decide — useful for
              donations or top-ups.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-title">What is this for?</Label>
              <Input
                id="link-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="September invoice — Sokoni Ltd"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-amount">Amount (optional)</Label>
              <Input
                id="link-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
              />
              {!validAmount ? (
                <p className="text-xs text-destructive">Enter a positive number.</p>
              ) : null}
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 p-3">
              <div>
                <Label htmlFor="link-reusable">Reusable</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Off means the link stops working after one successful payment.
                </p>
              </div>
              <Switch
                id="link-reusable"
                checked={reusable}
                onCheckedChange={setReusable}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={title.trim().length < 2 || !validAmount || create.isPending}
              onClick={() =>
                create.mutate(
                  {
                    title: title.trim(),
                    amount:
                      amount === ""
                        ? null
                        : Math.round(parsed * 10 ** decimalsFor("TZS")),
                    is_reusable: reusable,
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setTitle("");
                      setAmount("");
                    },
                  },
                )
              }
            >
              Create link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
