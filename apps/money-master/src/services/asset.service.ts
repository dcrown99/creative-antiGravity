import { prisma } from "@/lib/prisma";
import { Asset, Portfolio } from "@/types";
import { getCachedPrice, setCachedPrice, priceCache } from "@/lib/stock-price-cache";
import { getStockInfo } from "@/services/stock.service";
import { unstable_cache, revalidateTag } from "next/cache";
import { Calculator } from "@/lib/calculator";

const CACHE_TAG_ASSETS = 'assets';
const CACHE_TAG_PORTFOLIO = 'portfolio';

const ASSET_SELECT = {
  id: true,
  ticker: true,
  name: true,
  type: true,
  account: true,
  quantity: true,
  avgCost: true,
  currency: true,
  currentPrice: true,
  dividendRate: true,
  dividendYield: true,
  nextDividendDate: true,
  sector: true,
  manualPrice: true,
  balance: true,
  createdAt: true,
  updatedAt: true,
  isArchived: true,
};

function mapPrismaAssetToAsset(prismaAsset: any): Asset {
  return {
    ...prismaAsset,
    ticker: prismaAsset.ticker ?? undefined,
    account: prismaAsset.account ?? undefined,
    // Fix: Convert Decimal to number for UI compatibility using Calculator
    quantity: Calculator.toNumber(prismaAsset.quantity),
    avgCost: Calculator.toNumber(prismaAsset.avgCost),
    currentPrice: Calculator.toNumber(prismaAsset.currentPrice),
    dividendRate: Calculator.toNumber(prismaAsset.dividendRate),
    dividendYield: Calculator.toNumber(prismaAsset.dividendYield),
    nextDividendDate: prismaAsset.nextDividendDate ?? undefined,
    sector: prismaAsset.sector ?? undefined,
    manualPrice: Calculator.toNumber(prismaAsset.manualPrice),
    balance: Calculator.toNumber(prismaAsset.balance),
    description: prismaAsset.description ?? undefined,
    createdAt: prismaAsset.createdAt ? new Date(prismaAsset.createdAt).getTime() : undefined,
    updatedAt: prismaAsset.updatedAt ? new Date(prismaAsset.updatedAt).getTime() : undefined,
  } as Asset;
}

export const getAssets = unstable_cache(
  async (): Promise<Asset[]> => {
    const assets = await prisma.asset.findMany({
      select: ASSET_SELECT,
      orderBy: { createdAt: "desc" },
    });
    return assets.map(mapPrismaAssetToAsset);
  },
  ['getAssets'],
  { tags: [CACHE_TAG_ASSETS] }
);

export const getPortfolio = unstable_cache(
  async (): Promise<Portfolio> => {
    const assets = await prisma.asset.findMany({
      where: { isArchived: false },
      select: ASSET_SELECT,
      orderBy: { createdAt: "desc" },
    });
    // Dividends are fetched separately or empty here as per original
    return { assets: assets.map(mapPrismaAssetToAsset), dividends: [] };
  },
  ['getPortfolio'],
  { tags: [CACHE_TAG_PORTFOLIO] }
);

export async function getAsset(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
  });
  return asset ? mapPrismaAssetToAsset(asset) : null;
}

function mapAssetToPrismaInput(assetData: Partial<Asset>): any {
  const { createdAt, updatedAt, ...rest } = assetData;
  return {
    ...rest,
    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    ...(updatedAt ? { updatedAt: new Date(updatedAt) } : {}),
  };
}

export async function addAsset(data: Omit<Asset, "id" | "createdAt" | "updatedAt">) {
  const result = await prisma.asset.create({ data: mapAssetToPrismaInput(data) });
  revalidateTag(CACHE_TAG_ASSETS);
  revalidateTag(CACHE_TAG_PORTFOLIO);
  return result;
}

export async function updateAsset(id: string, data: Partial<Asset>) {
  const result = await prisma.asset.update({
    where: { id },
    data: mapAssetToPrismaInput(data),
  });
  revalidateTag(CACHE_TAG_ASSETS);
  revalidateTag(CACHE_TAG_PORTFOLIO);
  return result;
}

export async function deleteAsset(id: string) {
  const result = await prisma.asset.delete({
    where: { id },
  });
  revalidateTag(CACHE_TAG_ASSETS);
  revalidateTag(CACHE_TAG_PORTFOLIO);
  return result;
}

export async function unarchiveAsset(id: string) {
  const result = await prisma.asset.update({
    where: { id },
    data: { isArchived: false },
  });
  revalidateTag(CACHE_TAG_ASSETS);
  revalidateTag(CACHE_TAG_PORTFOLIO);
  return result;
}

export async function getStockName(ticker: string): Promise<string | null> {
  return ticker;
}

const CACHE_TAG_USDJPY = 'usdjpy';

export const getUsdJpyRate = unstable_cache(
  async (): Promise<number> => {
    try {
      const data = await getStockInfo('USDJPY=X');
      if (data.success && data.price > 0) {
        return data.price;
      }
      return 150.0;
    } catch (error) {
      console.error('Error fetching USD/JPY rate:', error);
      return 150.0;
    }
  },
  ['getUsdJpyRate'],
  {
    tags: [CACHE_TAG_USDJPY],
    revalidate: 3600
  }
);

export async function getPortfolioWithPrices(): Promise<{ portfolio: Portfolio, usdJpy: number }> {
  const portfolio = await getPortfolio();
  const usdJpy = await getUsdJpyRate();
  return { portfolio, usdJpy };
}

export async function overrideAllAssets(assets: Asset[]): Promise<void> {
  await prisma.asset.deleteMany({});
  // Prisma handles number -> Decimal conversion on create/createMany
  await prisma.asset.createMany({
    // @ts-ignore - Ignoring strict type check for bulk insert simplification
    data: assets.map(({ id, createdAt, updatedAt, ...asset }) => asset),
  });
  revalidateTag(CACHE_TAG_ASSETS);
  revalidateTag(CACHE_TAG_PORTFOLIO);
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      try {
        const value = await tasks[i]();
        results[i] = { status: 'fulfilled', value };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  }

  const workers = Array(Math.min(concurrency, tasks.length)).fill(null).map(worker);
  await Promise.all(workers);
  return results;
}

async function updateSingleAssetPrice(asset: Asset): Promise<boolean> {
  if (!asset.ticker) return false;

  try {
    const cached = getCachedPrice(asset.ticker);
    let priceData;

    if (cached) {
      priceData = {
        success: true,
        price: cached.price,
        dividendRate: cached.dividendRate,
        dividendYield: cached.dividendYield,
        nextDividendDate: cached.nextDividendDate,
      };
    } else {
      priceData = await getStockInfo(asset.ticker);
      if (priceData.success && priceData.price > 0) {
        setCachedPrice(asset.ticker, {
          price: priceData.price,
          dividendRate: priceData.dividendRate,
          dividendYield: priceData.dividendYield,
          nextDividendDate: priceData.nextDividendDate || undefined,
        });
      }
    }

    if (priceData.success && priceData.price > 0) {
      await prisma.asset.update({
        where: { id: asset.id },
        data: {
          currentPrice: priceData.price,
          dividendRate: priceData.dividendRate !== undefined && priceData.dividendRate !== null ? priceData.dividendRate : asset.dividendRate,
          dividendYield: priceData.dividendYield !== undefined && priceData.dividendYield !== null ? priceData.dividendYield : asset.dividendYield,
          nextDividendDate: priceData.nextDividendDate || asset.nextDividendDate,
        },
      });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(`Error updating price for ${asset.ticker}:`, error);
    const expiredCache = priceCache.get(asset.ticker);
    if (expiredCache) {
      await prisma.asset.update({
        where: { id: asset.id },
        data: {
          currentPrice: expiredCache.price,
          dividendRate: expiredCache.dividendRate ?? asset.dividendRate,
          dividendYield: expiredCache.dividendYield ?? asset.dividendYield,
          nextDividendDate: expiredCache.nextDividendDate ?? asset.nextDividendDate,
        },
      });
      return true;
    }
    throw error;
  }
}

export async function updateAllAssetPrices(): Promise<{ updated: number; failed: number }> {
  const assets = await prisma.asset.findMany({
    where: {
      ticker: { not: null },
      isArchived: false,
    },
  });

  const tasks = assets.map((prismaAsset) => () => updateSingleAssetPrice(mapPrismaAssetToAsset(prismaAsset)));
  const CONCURRENCY_LIMIT = 5;
  const results = await runWithConcurrency(tasks, CONCURRENCY_LIMIT);

  let updated = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value) updated++;
      else failed++;
    } else {
      failed++;
    }
  }

  if (updated > 0) {
    revalidateTag(CACHE_TAG_ASSETS);
    revalidateTag(CACHE_TAG_PORTFOLIO);
  }

  return { updated, failed };
}
