export interface MangaFile {
    name: string;
    size: number;
    mtime: number; // Unix timestamp
}

export interface LibraryItem extends MangaFile {
    progress: number;      // 0-100%
    lastReadAt: number;    // Unix timestamp (0 if unread)
    isFinished: boolean;   // 100% or last page
    pageCurrent: number;
    pageTotal: number;
}

export type SortOption = 'latest_added' | 'last_read' | 'alphabetical';
export type FilterOption = 'all' | 'unread' | 'reading' | 'finished';

export interface Collection {
    id?: number;
    name: string;
    bookNames: string[]; // Array of book names (filenames)
    createdAt: number;
    updatedAt: number;
}

export interface Bookmark {
    id?: number;
    bookName: string;
    pageIndex: number;
    note?: string;
    createdAt: number;
}

export interface BookMetadata {
    bookName: string; // Primary Key (filename)
    title?: string;
    author?: string; // Writer
    artist?: string; // Penciller
    series?: string;
    volume?: string; // Number
    summary?: string;
    genre?: string;
    publisher?: string;
    pageCount?: number;
    tags?: string[];
    rating?: number;
}
