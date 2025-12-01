'use client';

import { useCollections } from '@/hooks/use-collections';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { FolderIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@repo/ui';
import { Collection } from '@/types';

export function CollectionList() {
    const { collections, deleteCollection } = useCollections();

    if (!collections || collections.length === 0) {
        return null;
    }

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-bold text-muted-foreground">繧ｳ繝ｬ繧ｯ繧ｷ繝ｧ繝ｳ</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {collections.map((collection: Collection) => (
                    <Card key={collection.id} className="group relative hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FolderIcon className="w-5 h-5 text-primary" />
                                <span className="truncate">{collection.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {collection.bookNames.length} 蜀翫・譛ｬ
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => collection.id && deleteCollection(collection.id)}
                            >
                                <Trash2Icon className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
