import { Asset } from "@/types";

/**
 * Calculates the total value of the portfolio based on current prices.
 * 
 * @param assets List of assets in the portfolio
 * @param usdJpy Current USD/JPY exchange rate
 * @returns Total value in JPY
 */
export function calculateTotalAssets(assets: Asset[], usdJpy: number): number {
    return assets.reduce((sum, asset) => {
        if (asset.type === 'bank' || asset.type === 'cash') {
            return sum + (asset.balance || 0);
        }

        // For stocks, ETFs, mutual funds
        const price = asset.currentPrice || asset.manualPrice || asset.avgCost || 0;
        const quantity = asset.quantity || 0;

        // For mutual funds (TRUST), price is per 10000 units
        const actualQuantity = asset.type === 'TRUST' ? quantity / 10000 : quantity;
        const value = price * actualQuantity;

        // Convert USD to JPY if needed
        return sum + (asset.currency === 'USD' ? value * usdJpy : value);
    }, 0);
}
