import Dexie, { Table } from 'dexie';
import { Collection, Bookmark, BookMetadata } from '@/types';

class MyKindleDatabase extends Dexie {
    collections!: Table<Collection, number>;
    bookmarks!: Table<Bookmark, number>;
    metadata!: Table<BookMetadata, string>;

    constructor() {
        super('MyKindleDB');
        this.version(1).stores({
            collections: '++id, name, createdAt',
            bookmarks: '++id, bookName, pageIndex, [bookName+pageIndex], createdAt',
            metadata: 'bookName, author, series' // bookName is PK
        });
    }
}

export const db = new MyKindleDatabase();
