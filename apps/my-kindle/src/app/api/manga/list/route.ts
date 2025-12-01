import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getConfig } from '@/lib/config';
import { getZipInstance } from '@/lib/zip-cache';
import { getCache, setCache } from '@/lib/cache';

interface ZipEntry {
    isDirectory: boolean;
    name: string;
}

/**
 * API endpoint to list books or images within a book.
 * - If `book` query param is omitted, returns a list of book folder names.
 * - If `book` is provided, returns an array of image paths (including archive entries).
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');

    const config = getConfig();
    const BASE_DIR = config.libraryPath;

    // No book specified: list all book directories AND standalone archive files
    if (!book) {
        const cacheKey = 'book_list_root';
        const cached = getCache<string[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        try {
            if (!fs.existsSync(BASE_DIR)) return NextResponse.json([]);
            const entries = fs.readdirSync(BASE_DIR, { withFileTypes: true });
            const items = entries
                .filter((e) => e.isDirectory() || /\.(zip|cbz|rar|cbr)$/i.test(e.name))
                .map((e) => e.name);

            setCache(cacheKey, items);
            return NextResponse.json(items);
        } catch (error) {
            console.error('Failed to list books:', error);
            return NextResponse.json([], { status: 500 });
        }
    }

    // Book specified: list images inside the book folder OR archive file
    const bookPath = path.join(BASE_DIR, book);
    try {
        const relative = path.relative(BASE_DIR, bookPath);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
        }
        if (!fs.existsSync(bookPath)) {
            return NextResponse.json({ error: 'Book not found' }, { status: 404 });
        }

        const stats = fs.statSync(bookPath);

        // CASE A: Book is a standalone Archive File (.cbz, .zip)
        if (stats.isFile()) {
            if (/\.(zip|cbz)$/i.test(book)) {
                try {
                    const zip = await getZipInstance(bookPath);
                    const entries = await zip.entries();
                    const zipImages = Object.values(entries)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((entry: any) => {
                            const e = entry as ZipEntry;
                            return !e.isDirectory && /\.(jpg|jpeg|png|gif|webp)$/i.test(e.name);
                        })
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((entry: any) => (entry as ZipEntry).name)
                        .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                    // For standalone archives, we return the internal paths. 
                    // The thumbnail/image route must handle serving from the archive root.
                    return NextResponse.json(zipImages);
                } catch (zipError) {
                    console.error(`Failed to read archive ${book}:`, zipError);
                    return NextResponse.json([], { status: 500 });
                }
            }
            return NextResponse.json([]); // Not a supported archive
        }

        // CASE B: Book is a Directory (Existing Logic)
        const files = fs.readdirSync(bookPath);
        // 1. Direct image files in the folder
        let images = files
            .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        // 2. If no direct images, collect images from archives (zip/cbz)
        if (images.length === 0) {
            const archives = files
                .filter((f) => /\.(zip|cbz)$/i.test(f))
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

            if (archives.length > 0) {
                const combined: string[] = [];
                for (const archiveName of archives) {
                    const archivePath = path.join(bookPath, archiveName);
                    try {
                        const zip = await getZipInstance(archivePath);
                        const entries = await zip.entries();
                        const zipImages = Object.values(entries)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .filter((entry: any) => {
                                const e = entry as ZipEntry;
                                return !e.isDirectory && /\.(jpg|jpeg|png|gif|webp)$/i.test(e.name);
                            })
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .map((entry: any) => (entry as ZipEntry).name)
                            .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
                        zipImages.forEach((img: string) => combined.push(`${archiveName}/${img}`));
                    } catch (zipError) {
                        console.error(`Failed to read archive ${archiveName}:`, zipError);
                    }
                }
                images = combined;
            }
        }

        return NextResponse.json(images);
    } catch (error) {
        console.error('Failed to list images:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
