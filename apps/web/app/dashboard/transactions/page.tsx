import { PageHeader } from "@/components/shared/page-header";
import { TransactionsTable } from "@/components/tables/transactions-table";

export const metadata = { title: "Transactions" };

export default function MerchantTransactionsPage() {
  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every payment attempt on your account, with the fee and provider that handled it."
      />
      <TransactionsTable scope="merchant" />
    </>
  );
}
