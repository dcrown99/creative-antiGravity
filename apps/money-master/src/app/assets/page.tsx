import { getPortfolioWithPrices, getHistory } from '@/lib/actions';
import { AssetListClient } from '@/components/assets/AssetListClient';

export const dynamic = 'force-dynamic';

export default async function AssetsPage() {
  // Fetch data in parallel
  const [portfolioData, history] = await Promise.all([
    getPortfolioWithPrices(),
    getHistory()
  ]);

  const { portfolio, usdJpy } = portfolioData;

  return (
    <AssetListClient
      initialPortfolio={portfolio}
      initialUsdJpy={usdJpy}
      initialHistory={history}
    />
  );
}
