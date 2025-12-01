import Papa from 'papaparse';
import { Transaction, TransactionType } from '@/types';

interface SBIRow {
    '国内/海外': string;
    '約定日': string;
    '受渡日': string;
    '銘柄コード': string;
    '銘柄': string;
    '取引': string;
    '受渡金額': string; // Amount
}

export function parseSBICSV(csvData: string): Partial<Transaction>[] {
    const parsed = Papa.parse<SBIRow>(csvData, {
        header: true,
        skipEmptyLines: true
    });

    return parsed.data
        .filter(row => row['受渡日'] && row['受渡金額'])
        .map(row => {
            const amountStr = row['受渡金額'].replace(/,/g, '');
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
            } else if (typeStr.includes('配当') || typeStr.includes('分配')) {
                type = 'income';
                category = 'Dividend';
            } else if (typeStr.includes('入金')) {
                type = 'income';
                category = 'Transfer';
            } else if (typeStr.includes('出金')) {
                type = 'expense';
                category = 'Transfer';
            }

            return {
                date: row['受渡日'].replace(/\//g, '-'),
                amount: Math.abs(amount),
                type,
                category,
                description: `${row['銘柄']} (${typeStr})`,
            };
        });
}
