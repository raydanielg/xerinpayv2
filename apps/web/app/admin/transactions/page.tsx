import { PageHeader } from "@/components/shared/page-header";
import { TransactionsTable } from "@/components/tables/transactions-table";

export const metadata = { title: "Transactions" };

export default function AdminTransactionsPage() {
  return (
    <>
      <PageHeader
        title="Transactions"
        description="Platform-wide payment activity across every merchant and provider."
      />
      <TransactionsTable scope="admin" />
    </>
  );
}
