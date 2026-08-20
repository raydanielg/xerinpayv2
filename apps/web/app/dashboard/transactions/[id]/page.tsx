import { TransactionDetail } from "@/components/transactions/transaction-detail";

export const metadata = { title: "Transaction" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransactionDetail id={id} scope="merchant" />;
}
