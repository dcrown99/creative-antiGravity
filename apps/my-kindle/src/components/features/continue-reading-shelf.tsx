import { LibraryItem } from '@/types';
import { BookCard } from './book-card';
import { ScrollArea, ScrollBar } from '@repo/ui';

interface ContinueReadingShelfProps {
    books: LibraryItem[];
}

export function ContinueReadingShelf({ books }: ContinueReadingShelfProps) {
    if (books.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white">続きから読む</h2>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex w-max space-x-4">
                    {books.map((book) => (
                        <div key={book.name} className="w-[150px]">
                            <BookCard book={book} />
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
