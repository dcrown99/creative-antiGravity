import { parseRakutenCSV } from './rakuten';
import { parseSBICSV } from './sbi';
import { parseRakutenBankCSV } from './rakuten-bank';
import { Transaction } from '@/types';

export type CSVFormat = 'rakuten' | 'rakuten-bank' | 'sbi' | 'unknown';

export function detectFormat(csvData: string): CSVFormat {
    const firstLine = csvData.split('\n')[0];
    if (firstLine.includes('受渡日') && firstLine.includes('受渡金額/決済損益')) {
        return 'rakuten';
    }
    if (firstLine.includes('取引日') && firstLine.includes('入出金(円)') && firstLine.includes('入出金内容')) {
        return 'rakuten-bank';
    }
    if (firstLine.includes('約定日') && firstLine.includes('受渡金額') && firstLine.includes('銘柄コード')) {
        return 'sbi';
    }
    return 'unknown';
}

export function parseCSV(csvData: string, format: CSVFormat): Partial<Transaction>[] {
    switch (format) {
        case 'rakuten':
            return parseRakutenCSV(csvData);
        case 'rakuten-bank':
            return parseRakutenBankCSV(csvData);
        case 'sbi':
            return parseSBICSV(csvData);
        default:
            throw new Error('Unsupported CSV format');
    }
}
