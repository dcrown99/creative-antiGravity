'use client';

import { useState } from 'react';
import { useCollections } from '@/hooks/use-collections';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/ui';
import { PlusIcon } from 'lucide-react';

export function CreateCollectionDialog() {
    const { addCollection } = useCollections();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) return;
        await addCollection(name);
        setName('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <PlusIcon className="w-4 h-4" />
                    コレクション作成
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>コレクションを作成</DialogTitle>
                    <DialogDescription>
                        新しいコレクションの名前を入力してください。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            名前
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="例: お気に入り, 完結済み"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreate}>作成</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
