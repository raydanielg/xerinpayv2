import { PageHeader } from "@/components/shared/page-header";
import { RefundsTable } from "@/components/tables/refunds-table";

export const metadata = { title: "Refunds" };

export default function MerchantRefundsPage() {
  return (
    <>
      <PageHeader
        title="Refunds"
        description="Refund requests you've raised and their current state."
      />
      <RefundsTable scope="merchant" />
    </>
  );
}
