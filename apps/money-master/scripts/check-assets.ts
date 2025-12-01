import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const assets = await prisma.asset.findMany({
        orderBy: { createdAt: 'desc' },
    });

    console.log('Total assets:', assets.length);
    // Print as JSON for easier parsing if table is messy
    console.log(JSON.stringify(assets.map(a => ({
        name: a.name,
        type: a.type,
        account: a.account,
        currency: a.currency,
        isArchived: a.isArchived,
        balance: a.balance,
        quantity: a.quantity,
        currentPrice: a.currentPrice
    })), null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
