import Papa from 'papaparse';
import { Transaction, TransactionType } from '@/types';

interface RakutenRow {
    '受渡日': string; // Date
    '銘柄名': string; // Description/Asset Name
    '取引': string;   // Type (Buy/Sell/Dividend etc.)
    '受渡金額/決済損益': string; // Amount (with commas)
    '口座': string;   // Account type
    '銘柄コード': string; // Ticker
}

export function parseRakutenCSV(csvData: string): Partial<Transaction>[] {
    const parsed = Papa.parse<RakutenRow>(csvData, {
        header: true,
        skipEmptyLines: true
    });

    return parsed.data
        .filter(row => row['受渡日'] && row['受渡金額/決済損益']) // Filter invalid rows
        .map(row => {
            const amountStr = row['受渡金額/決済損益'].replace(/,/g, '');
            const amount = parseFloat(amountStr);
            const typeStr = row['取引'];

            let type: TransactionType = 'expense';
            let category = 'Uncategorized';

            if (typeStr.includes('買')) {
                type = 'expense';
                category = 'Investment';
            } else if (typeStr.includes('売')) {
                type = 'income';
                category = 'Investment';
            } else if (typeStr.includes('配当') || typeStr.includes('分配金')) {
                type = 'income';
                category = 'Dividend';
            } else if (typeStr.includes('入金')) {
                type = 'income';
                category = 'Transfer';
            } else if (typeStr.includes('出金')) {
                type = 'expense';
                category = 'Transfer';
            }

            // Adjust amount sign: Expense should be positive in our DB (amount is absolute), 
            // but usually CSVs have negative for outflows.
            // Wait, our DB stores amount as positive number, and 'type' determines direction.
            // Rakuten CSV: Buying is usually negative amount (outflow), Selling is positive.
            // So we take absolute value.

            return {
                date: row['受渡日'].replace(/\//g, '-'), // Ensure YYYY-MM-DD
                amount: Math.abs(amount),
                type,
                category,
                description: `${row['銘柄名']} (${typeStr})`,
                // We can't easily map assetId here without looking up by ticker.
                // For now, we leave assetId undefined, user might need to link it later or we do a lookup.
            };
        });
}
