'use client';

import { useState } from 'react';
import { useCollections } from '@/hooks/use-collections';
import { Button } from '@repo/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/ui';
// import { Checkbox } from '@repo/ui'; // Need to install checkbox? Or use native input
import { Label } from '@repo/ui';
import { FolderPlusIcon } from 'lucide-react';

export function AddToCollectionDialog({ bookName }: { bookName: string }) {
    const { collections, addBookToCollection, removeBookFromCollection } = useCollections();
    const [open, setOpen] = useState(false);

    const handleToggle = async (collectionId: number, checked: boolean) => {
        if (checked) {
            await addBookToCollection(collectionId, bookName);
        } else {
            await removeBookFromCollection(collectionId, bookName);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md"
                    onClick={(e) => e.stopPropagation()} // Prevent navigation
                >
                    <FolderPlusIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>コレクションに追加</DialogTitle>
                    <DialogDescription>
                        「{bookName}」を追加するコレクションを選択してください。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
                    {collections?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                            コレクションがありません。先に作成してください。
                        </p>
                    )}
                    {collections?.map((collection) => {
                        const isIncluded = collection.bookNames.includes(bookName);
                        return (
                            <div key={collection.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={`col-${collection.id}`}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={isIncluded}
                                    onChange={(e) => collection.id && handleToggle(collection.id, e.target.checked)}
                                />
                                <Label htmlFor={`col-${collection.id}`} className="flex-1 cursor-pointer">
                                    {collection.name}
                                </Label>
                            </div>
                        );
                    })}
                </div>
                <DialogFooter>
                    <Button onClick={() => setOpen(false)}>閉じる</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
