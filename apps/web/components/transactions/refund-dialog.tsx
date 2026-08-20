"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
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
import { Textarea } from "@workspace/ui/components/textarea";

import { useCreateRefund } from "@/lib/api/queries";
import { decimalsFor, formatMoney, toMajor } from "@/lib/format";
import type { Transaction } from "@/lib/api/types";

/**
 * Refund request.
 *
 * This creates a *request*, not a payout. Under separation of duties whoever
 * raises a refund should not be the one who releases it, so approval happens
 * separately in the refunds queue.
 */
export function RefundDialog({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
}) {
  const createRefund = useCreateRefund();
  const decimals = decimalsFor(transaction.currency);
  const maxMajor = toMajor(transaction.amount, transaction.currency);

  const [amount, setAmount] = React.useState(String(maxMajor));
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setAmount(String(maxMajor));
      setReason("");
    }
  }, [open, maxMajor]);

  const parsed = Number(amount);
  const valid =
    Number.isFinite(parsed) && parsed > 0 && parsed <= maxMajor && reason.trim().length >= 4;
  const partial = Number.isFinite(parsed) && parsed > 0 && parsed < maxMajor;

  async function submit() {
    const minor = Math.round(parsed * 10 ** decimals);
    await createRefund
      .mutateAsync({
        transaction: transaction.id,
        amount: minor,
        reason: reason.trim(),
      })
      .then(() => onOpenChange(false))
      .catch(() => {
        /* toast already surfaced by the mutation */
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a refund</DialogTitle>
          <DialogDescription>
            {transaction.reference} · {formatMoney(transaction.amount, transaction.currency)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refund-amount">Amount ({transaction.currency})</Label>
            <Input
              id="refund-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={createRefund.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Maximum {formatMoney(transaction.amount, transaction.currency)}.
              {partial ? " This will be a partial refund." : ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason</Label>
            <Textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Customer cancelled the order before dispatch."
              rows={3}
              disabled={createRefund.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Recorded in the audit log and shown to whoever approves this.
            </p>
          </div>

          <Alert>
            <AlertTriangle className="size-4" />
            <AlertDescription>
              Refunds cannot be reversed once processed. This request goes to an
              approver before any money moves.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRefund.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid || createRefund.isPending}>
            {createRefund.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
