import { getPortfolioWithPrices, getMonthlyTransactionSummary, getRecentTransactions, getAssetHistory, recordDailyHistory } from "@/lib/actions";
import { calculateTotalAssets } from "@/lib/portfolio-logic";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // Parallel data fetching for improved performance
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // recordDailyHistory を Promise.all に含める
    const [
        _,
        { portfolio, usdJpy },
        monthlyTransactions,
        recentTransactions,
        assetHistory
    ] = await Promise.all([
        recordDailyHistory(),
        getPortfolioWithPrices(),
        getMonthlyTransactionSummary(currentYear, currentMonth),
        getRecentTransactions(5),
        getAssetHistory(30),
    ]);

    // Calculate total value including all asset types
    const totalValue = calculateTotalAssets(portfolio.assets, usdJpy);

    return (
        <DashboardClient
            portfolio={portfolio}
            monthlyTransactions={monthlyTransactions}
            recentTransactions={recentTransactions}
            totalValue={totalValue}
            usdJpy={usdJpy}
            assetHistory={assetHistory}
        />
    );
}
