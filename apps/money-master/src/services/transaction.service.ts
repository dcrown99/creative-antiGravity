import { prisma } from "@/lib/prisma";
import { Transaction, TransactionType } from "@/types";
import { Calculator } from "@/lib/calculator";

function mapPrismaTransactionToTransaction(prismaTransaction: any): Transaction {
  return {
    id: prismaTransaction.id,
    date: prismaTransaction.date, // Already stored as string in DB
    // Fix: Convert Decimal to number for UI using Adapter
    amount: Calculator.toNumber(prismaTransaction.amount),
    type: prismaTransaction.type as TransactionType,
    category: prismaTransaction.category,
    description: prismaTransaction.description || undefined,
    assetId: prismaTransaction.assetId || undefined,
    createdAt: prismaTransaction.createdAt ? new Date(prismaTransaction.createdAt).getTime() : Date.now(),
  };
}

function mapTransactionToPrismaInput(transactionData: Partial<Transaction>): any {
  const { createdAt, ...rest } = transactionData;
  return {
    ...rest,
    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
  };
}

export async function getTransactions(): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return transactions.map(mapPrismaTransactionToTransaction);
}

/**
 * Get recent transactions with a limit
 * @param limit - Number of recent transactions to fetch (default: 5)
 */
export async function getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });
  return transactions.map(mapPrismaTransactionToTransaction);
}


export async function createTransaction(data: Omit<Transaction, "id" | "createdAt">) {
  return await prisma.transaction.create({ data: mapTransactionToPrismaInput(data) });
}

export async function updateTransaction(id: string, data: Partial<Transaction>) {
  return await prisma.transaction.update({
    where: { id },
    data: mapTransactionToPrismaInput(data),
  });
}

export async function deleteTransaction(id: string) {
  return await prisma.transaction.delete({ where: { id } });
}

/**
 * Get monthly transaction summary
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 */
export async function getMonthlyTransactionSummary(
  year: number,
  month: number
): Promise<{ income: number; expense: number; balance: number }> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const aggregations = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  let income = 0;
  let expense = 0;

  aggregations.forEach(agg => {
    // Fix: Prisma aggregation returns Decimal for sum. Convert safely.
    const amount = Calculator.toNumber(agg._sum.amount);

    if (agg.type === 'income') {
      income = amount;
    } else if (agg.type === 'expense') {
      expense = amount;
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export async function overrideAllTransactions(transactions: Transaction[]): Promise<void> {
  await prisma.transaction.deleteMany({});
  await prisma.transaction.createMany({
    data: transactions.map((t) => {
      const { id, createdAt, ...rest } = t;
      return {
        ...rest,
        // Ensure amount is handled correctly by Prisma (number -> Decimal auto-conversion works fine for inputs)
      };
    }),
  });
}

export async function detectMissingDividends(): Promise<Transaction[]> {
  return [];
}

export async function registerDividends(dividends: Transaction[]): Promise<void> {
  await prisma.transaction.createMany({
    data: dividends.map((d) => {
      const { id, createdAt, ...rest } = d;
      return rest;
    }),
  });
}
