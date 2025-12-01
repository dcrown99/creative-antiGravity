import { LibraryItem } from '@/types';

export interface SeriesGroup {
    id: string;
    title: string;
    books: LibraryItem[];
    isSeries: boolean;
    coverBook: LibraryItem; // The book to use for the cover (usually the first one)
    lastReadAt: number; // Max lastReadAt of books in series
    addedAt: number; // Max mtime of books in series
}

// Common patterns for volume numbers
// e.g., " Vol.1", " v01", " - 01", " 01", "(01)", "[01]"
const VOLUME_PATTERNS = [
    /\s*v(?:ol)?\.?\s*\d+/i,
    /\s*-\s*\d+/,
    /\s+\d+$/,
    /\s*\(\d+\)$/,
    /\s*\[\d+\]$/
];

function normalizeTitle(title: string): string {
    let normalized = title;

    // Remove file extension
    normalized = normalized.replace(/\.(zip|cbz|rar|cbr)$/i, '');

    // Remove common volume patterns
    // We try to be conservative to avoid merging unrelated books
    // A better approach might be to look for common prefixes among all books

    // Simple heuristic: Remove trailing numbers and volume indicators
    for (const pattern of VOLUME_PATTERNS) {
        normalized = normalized.replace(pattern, '');
    }

    return normalized.trim();
}

export function groupBooksBySeries(books: LibraryItem[]): SeriesGroup[] {
    const groups: Record<string, LibraryItem[]> = {};

    // 1. Group by normalized title
    books.forEach(book => {
        const seriesTitle = normalizeTitle(book.name);
        if (!groups[seriesTitle]) {
            groups[seriesTitle] = [];
        }
        groups[seriesTitle].push(book);
    });

    // 2. Convert to SeriesGroup objects
    const result: SeriesGroup[] = Object.entries(groups).map(([title, groupBooks]) => {
        // Sort books in the group (e.g. by name)
        groupBooks.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        const isSeries = groupBooks.length > 1;

        // Determine cover book (first volume)
        const coverBook = groupBooks[0];

        // Aggregated stats
        const lastReadAt = Math.max(...groupBooks.map(b => b.lastReadAt || 0));
        const addedAt = Math.max(...groupBooks.map(b => b.mtime));

        return {
            id: `series-${title}`,
            title: isSeries ? title : groupBooks[0].name, // Use original name if not a series
            books: groupBooks,
            isSeries,
            coverBook,
            lastReadAt,
            addedAt
        };
    });

    return result;
}
