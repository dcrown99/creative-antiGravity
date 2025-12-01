import { getAssetHistory, getAssetAllocation, getPortfolioWithPrices } from "@/lib/actions";
import { calculateTotalAssets } from "@/lib/portfolio-logic";
import { AssetHistoryChart } from "@/components/analytics/AssetHistoryChart";
import { AssetAllocationChart } from "@/components/analytics/AssetAllocationChart";
import { PerformanceSummary } from "@/components/analytics/PerformanceSummary";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const [history, allocation, { portfolio, usdJpy }] = await Promise.all([
    getAssetHistory(30),
    getAssetAllocation(),
    getPortfolioWithPrices(),
  ]);

  const currentTotalValue = calculateTotalAssets(portfolio.assets, usdJpy);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">分析レポート</h1>
      </div>

      <PerformanceSummary history={history} currentTotalValue={currentTotalValue} />

      <div className="grid gap-6 md:grid-cols-7">
        <AssetHistoryChart data={history} currentTotalValue={currentTotalValue} />
        <AssetAllocationChart data={allocation} />
      </div>
    </div>
  );
}
