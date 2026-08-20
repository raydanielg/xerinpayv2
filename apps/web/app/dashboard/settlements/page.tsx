import { PageHeader } from "@/components/shared/page-header";
import { SettlementsTable } from "@/components/tables/settlements-table";

export const metadata = { title: "Settlements" };

export default function MerchantSettlementsPage() {
  return (
    <>
      <PageHeader
        title="Settlements"
        description="Money paid out to your bank account, and what each batch contained."
      />
      <SettlementsTable scope="merchant" />
    </>
  );
}
