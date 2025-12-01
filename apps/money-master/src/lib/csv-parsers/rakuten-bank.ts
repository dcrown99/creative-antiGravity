import Papa from 'papaparse';
import { Transaction, TransactionType } from '@/types';

interface RakutenBankRow {
    '取引日': string;
    '入出金(円)': string;
    '入出金内容': string;
    '取引後残高(円)': string;
}

export function parseRakutenBankCSV(csvData: string): Partial<Transaction>[] {
    const parsed = Papa.parse<RakutenBankRow>(csvData, {
        header: true,
        skipEmptyLines: true
    });

    return parsed.data
        .filter(row => row['取引日'] && row['入出金(円)'])
        .map(row => {
            const amountStr = row['入出金(円)'].replace(/,/g, '');
            const amount = parseFloat(amountStr);
            const description = row['入出金内容'];

            let type: TransactionType = 'expense';
            let category = 'Uncategorized';

            if (amount > 0) {
                type = 'income';
                if (description.includes('振込')) {
                    category = 'Transfer';
                } else if (description.includes('利息')) {
                    category = 'Dividend'; // Interest is kinda dividend
                } else {
                    category = 'Income';
                }
            } else {
                type = 'expense';
                if (description.includes('振込')) {
                    category = 'Transfer';
                } else {
                    category = 'Expense';
                }
            }

            return {
                date: row['取引日'].replace(/\./g, '-'), // Assuming YYYY.MM.DD or similar, normalize to YYYY-MM-DD
                amount: Math.abs(amount),
                type,
                category,
                description: description,
            };
        });
}
