import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), 'data');

async function readJson<T>(filename: string): Promise<T | null> {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return null;
    }
}

async function main() {
    console.log('Start seeding...');

    // 1. Assets & Dividends
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portfolio = await readJson<{ assets: any[], dividends: any[] }>('portfolio.json');
    if (portfolio?.assets) {
        console.log(`Seeding ${portfolio.assets.length} assets...`);
        for (const asset of portfolio.assets) {
            await prisma.asset.upsert({
                where: { id: asset.id },
                update: {},
                create: {
                    id: asset.id,
                    ticker: asset.ticker,
                    name: asset.name,
                    type: asset.type,
                    account: asset.account,
                    quantity: asset.quantity,
                    avgCost: asset.avgCost,
                    currency: asset.currency,
                    currentPrice: asset.currentPrice,
                    dividendRate: asset.dividendRate,
                    dividendYield: asset.dividendYield,
                    nextDividendDate: asset.nextDividendDate,
                    sector: asset.sector,
                    manualPrice: asset.manualPrice,
                    balance: asset.balance,
                    description: asset.description,
                    createdAt: asset.createdAt ? new Date(asset.createdAt) : new Date(),
                    updatedAt: asset.updatedAt ? new Date(asset.updatedAt) : new Date(),
                    isArchived: asset.isArchived || false,
                },
            });
        }
    }

    if (portfolio?.dividends) {
        console.log(`Seeding ${portfolio.dividends.length} dividends...`);
        for (const div of portfolio.dividends) {
            // Ensure asset exists
            const assetExists = await prisma.asset.findUnique({ where: { id: div.assetId } });
            if (assetExists) {
                await prisma.dividend.upsert({
                    where: { id: div.id },
                    update: {},
                    create: {
                        id: div.id,
                        assetId: div.assetId,
                        date: div.date,
                        amount: div.amount,
                        currency: div.currency,
                    },
                });
            }
        }
    }

    // 2. Transactions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transactions = await readJson<any[]>('transactions.json');
    if (transactions) {
        console.log(`Seeding ${transactions.length} transactions...`);
        for (const tx of transactions) {
            await prisma.transaction.upsert({
                where: { id: tx.id },
                update: {},
                create: {
                    id: tx.id,
                    date: tx.date,
                    amount: tx.amount,
                    type: tx.type,
                    category: tx.category,
                    description: tx.description,
                    assetId: tx.assetId,
                    createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
                },
            });
        }
    }

    // 3. History
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = await readJson<any[]>('history.json');
    if (history) {
        console.log(`Seeding ${history.length} history entries...`);
        for (const entry of history) {
            await prisma.historyEntry.upsert({
                where: { date: entry.date },
                update: {},
                create: {
                    date: entry.date,
                    totalValue: entry.totalValue,
                    totalCost: entry.totalCost,
                    totalPL: entry.totalPL,
                },
            });
        }
    }

    // 4. Analysis Logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = await readJson<any[]>('analysis_logs.json');
    if (logs) {
        console.log(`Seeding ${logs.length} analysis logs...`);
        for (const log of logs) {
            await prisma.analysisLog.upsert({
                where: { id: log.id },
                update: {},
                create: {
                    id: log.id,
                    date: log.date,
                    title: log.title,
                    summary: log.summary,
                    script: log.script,
                    sources: JSON.stringify(log.sources || []),
                },
            });
        }
    }

    // 5. Category Rules
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rules = await readJson<any[]>('rules.json');
    if (rules) {
        console.log(`Seeding ${rules.length} category rules...`);
        for (const rule of rules) {
            await prisma.categoryRule.upsert({
                where: { pattern: rule.pattern },
                update: { category: rule.category },
                create: {
                    pattern: rule.pattern,
                    category: rule.category,
                },
            });
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
