import { getDividends, getPortfolioWithPrices } from "@/lib/actions";
import { DividendListClient } from "@/components/dividends/DividendListClient";
import { DividendAssetSummary } from "@/components/dividends/DividendAssetSummary";

export const dynamic = 'force-dynamic';

export default async function DividendsPage() {
  const dividends = await getDividends();
  const { portfolio, usdJpy } = await getPortfolioWithPrices();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">配当管理</h1>
      </div>

      <DividendAssetSummary assets={portfolio.assets} usdJpy={usdJpy} />

      <DividendListClient
        initialDividends={dividends}
        assets={portfolio.assets}
      />
    </div>
  );
}
