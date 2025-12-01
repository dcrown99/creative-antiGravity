import { prisma } from "@/lib/prisma";
import { Dividend } from "@/types";
import { Calculator } from "@/lib/calculator";

export async function getDividends(): Promise<(Dividend & { asset: { name: string; ticker: string | null } })[]> {
    const dividends = await prisma.dividend.findMany({
        orderBy: { date: 'desc' },
        include: {
            asset: {
                select: {
                    name: true,
                    ticker: true,
                }
            }
        }
    });

    return dividends.map(d => ({
        ...d,
        // Fix: Convert Decimal to number for UI compatibility
        amount: Calculator.toNumber(d.amount),
        currency: d.currency as 'JPY' | 'USD',
    }));
}

export async function addDividend(dividend: Omit<Dividend, 'id'>) {
    return await prisma.dividend.create({
        data: {
            assetId: dividend.assetId,
            date: dividend.date,
            amount: dividend.amount,
            currency: dividend.currency,
        },
    });
}

export async function deleteDividend(id: string) {
    return await prisma.dividend.delete({
        where: { id },
    });
}

export async function addDividendsBulk(dividends: Omit<Dividend, 'id'>[]) {
    const results = await prisma.dividend.createMany({
        data: dividends.map(d => ({
            assetId: d.assetId,
            date: d.date,
            amount: d.amount,
            currency: d.currency,
        })),
    });
    return results;
}
