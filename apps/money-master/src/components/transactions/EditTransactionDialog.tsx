'use client';

import { useState } from 'react';
import { Button } from '@repo/ui';
import { updateTransactionAction } from '@/lib/actions';
import { Pencil, X } from 'lucide-react';
import { Transaction } from '@/types';

interface EditTransactionDialogProps {
  transaction: Transaction;
}

export function EditTransactionDialog({ transaction }: EditTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateTransactionAction(transaction.id, formData);
      if (result.success) {
        setIsOpen(false);
      } else {
        alert('更新に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <Pencil className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold mb-4">取引を編集</h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">日付</label>
            <input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={transaction.date}
              className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">タイプ</label>
            <select
              name="type"
              id="type"
              required
              defaultValue={transaction.type}
              className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            >
              <option value="expense">支出</option>
              <option value="income">収入</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">カテゴリ</label>
            <input
              type="text"
              name="category"
              id="category"
              required
              defaultValue={transaction.category}
              className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">金額</label>
            <input
              type="number"
              name="amount"
              id="amount"
              required
              min="0"
              defaultValue={transaction.amount}
              className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">内容（任意）</label>
            <input
              type="text"
              name="description"
              id="description"
              defaultValue={transaction.description}
              className="w-full p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
