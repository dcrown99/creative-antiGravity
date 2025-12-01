'use client';

import { useState, useMemo, memo } from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { deleteTransactionAction } from '@/lib/actions';
import { AddTransactionDialog } from './AddTransactionDialog';
import { EditTransactionDialog } from './EditTransactionDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Card,
    Button,
    Badge,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@repo/ui';
import { Trash2, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionListClientProps {
    initialTransactions: Transaction[];
}

// Helper to format date consistently
const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';

    // Handle YYYYMMDD format
    if (/^\d{8}$/.test(dateStr)) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
    }

    // Handle already formatted dates or other formats
    return dateStr;
};

// Memoized transaction row component to prevent unnecessary re-renders
const TransactionRow = memo(({
    transaction,
    onDelete,
    isDeleting
}: {
    transaction: Transaction;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) => {
    return (
        <TableRow>
            <TableCell className="font-mono">{formatDate(transaction.date)}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                        <ArrowUpCircle className="w-4 h-4 text-green-500" />
                    ) : (
                        <ArrowDownCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '収入' : '支出'}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline">{transaction.category}</Badge>
            </TableCell>
            <TableCell>{transaction.description || '-'}</TableCell>
            <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <EditTransactionDialog transaction={transaction} />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
                        disabled={isDeleting}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
});

TransactionRow.displayName = 'TransactionRow';

export function TransactionListClient({ initialTransactions }: TransactionListClientProps) {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    // フィルタリング用のState
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // カテゴリリストの動的生成
    const uniqueCategories = useMemo(() => {
        const categories = new Set(transactions.map(t => t.category));
        return Array.from(categories).sort();
    }, [transactions]);

    // フィルタリング済み取引リスト
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            // 検索キーワードフィルタ
            const matchesSearch = searchTerm === '' ||
                transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.amount.toString().includes(searchTerm);

            // 種別フィルタ
            const matchesType = filterType === 'all' || transaction.type === filterType;

            // カテゴリフィルタ
            const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;

            return matchesSearch && matchesType && matchesCategory;
        });
    }, [transactions, searchTerm, filterType, filterCategory]);

    // Calculate pagination (filteredTransactionsベース)
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Memoize paginated transactions to avoid recalculation on every render
    const paginatedTransactions = useMemo(
        () => filteredTransactions.slice(startIndex, endIndex),
        [filteredTransactions, startIndex, endIndex]
    );

    const handleDelete = async (id: string) => {
        if (!confirm('この取引を削除してもよろしいですか？')) return;

        setIsDeleting(id);
        try {
            await deleteTransactionAction(id);
            setTransactions(prev => {
                const newTransactions = prev.filter(t => t.id !== id);
                // Adjust current page if needed after deletion
                const newTotalPages = Math.ceil(newTransactions.length / itemsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
                return newTransactions;
            });
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            alert('削除に失敗しました');
        } finally {
            setIsDeleting(null);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">取引一覧</h2>
                <AddTransactionDialog />
            </div>

            <Card>
                {/* フィルタコントロールエリア */}
                <div className="p-4 border-b space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 検索窓 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">検索</label>
                            <Input
                                type="text"
                                placeholder="内容や金額で検索..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* 種別フィルタ */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">種別</label>
                            <Select value={filterType} onValueChange={(value: string) => setFilterType(value as 'all' | 'income' | 'expense')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">すべて</SelectItem>
                                    <SelectItem value="income">収入</SelectItem>
                                    <SelectItem value="expense">支出</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* カテゴリフィルタ */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">カテゴリ</label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">すべて</SelectItem>
                                    {uniqueCategories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* フィルタリセットボタン */}
                    {(searchTerm !== '' || filterType !== 'all' || filterCategory !== 'all') && (
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterType('all');
                                    setFilterCategory('all');
                                    setCurrentPage(1);
                                }}
                            >
                                フィルタをリセット
                            </Button>
                        </div>
                    )}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>日付</TableHead>
                            <TableHead>タイプ</TableHead>
                            <TableHead>カテゴリ</TableHead>
                            <TableHead>内容</TableHead>
                            <TableHead className="text-right">金額</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {transactions.length === 0
                                        ? '取引データがありません'
                                        : 'フィルタ条件に一致する取引が見つかりません'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <TransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    onDelete={handleDelete}
                                    isDeleting={isDeleting === transaction.id}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            {filteredTransactions.length} 件中 {startIndex + 1} - {Math.min(endIndex, filteredTransactions.length)} 件を表示
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                前へ
                            </Button>
                            <span className="text-sm">
                                ページ {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                次へ
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
