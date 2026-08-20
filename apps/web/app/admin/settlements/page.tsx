import { PageHeader } from "@/components/shared/page-header";
import { SettlementsTable } from "@/components/tables/settlements-table";

export const metadata = { title: "Settlements" };

export default function AdminSettlementsPage() {
  return (
    <>
      <PageHeader
        title="Settlements"
        description="Payout batches per merchant. Approval is separate from creation."
      />
      <SettlementsTable scope="admin" />
    </>
  );
}
