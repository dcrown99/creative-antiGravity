import { getTransactions } from '@/lib/actions';
import { TransactionListClient } from '@/components/transactions/TransactionListClient';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">取引明細</h1>
      <TransactionListClient initialTransactions={transactions} />
    </div>
  );
}
