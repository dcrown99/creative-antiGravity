import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Re-implementing the logic from analytics.service.ts to verify it against real data
// We do this to avoid potential import issues with path aliases in the script environment
async function main() {
    const assets = await prisma.asset.findMany({
        where: { isArchived: false },
    });

    console.log(`Found ${assets.length} assets`);

    const groups: Record<string, number> = {};
    const key = 'account';

    assets.forEach(asset => {
        let groupKey = String(asset[key] || 'Unknown');
        const type = asset.type;

        // The logic we added
        if (key === 'account' && (groupKey === 'Unknown' || groupKey === 'null') && (type === 'cash' || type === 'bank')) {
            groupKey = 'bank';
        }

        const price = asset.currentPrice ? Number(asset.currentPrice) : (asset.manualPrice ? Number(asset.manualPrice) : 0);
        const quantity = asset.quantity ? Number(asset.quantity) : 0;
        let value = price * quantity;

        if ((type === 'bank' || type === 'cash') && asset.balance) {
            value = Number(asset.balance);
        }

        // Simplified value calculation (ignoring USD conversion for now as we just want to see keys)
        groups[groupKey] = (groups[groupKey] || 0) + value;
    });

    console.log('By Account Groups:', JSON.stringify(groups, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
