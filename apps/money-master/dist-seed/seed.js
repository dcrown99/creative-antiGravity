"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const DATA_DIR = path_1.default.join(process.cwd(), 'data');
async function readJson(filename) {
    try {
        const filePath = path_1.default.join(DATA_DIR, filename);
        const data = await promises_1.default.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        return null;
    }
}
async function main() {
    console.log('Start seeding...');
    // 1. Assets & Dividends
    const portfolio = await readJson('portfolio.json');
    if (portfolio === null || portfolio === void 0 ? void 0 : portfolio.assets) {
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
    if (portfolio === null || portfolio === void 0 ? void 0 : portfolio.dividends) {
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
    const transactions = await readJson('transactions.json');
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
    const history = await readJson('history.json');
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
    const logs = await readJson('analysis_logs.json');
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
    const rules = await readJson('rules.json');
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
