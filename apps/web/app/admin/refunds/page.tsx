import { PageHeader } from "@/components/shared/page-header";
import { RefundsTable } from "@/components/tables/refunds-table";

export const metadata = { title: "Refunds" };

export default function AdminRefundsPage() {
  return (
    <>
      <PageHeader
        title="Refunds"
        description="Approval queue. A refund cannot be approved by the person who raised it."
      />
      <RefundsTable scope="admin" />
    </>
  );
}
