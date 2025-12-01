import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getConfig } from '@/lib/config';
import { getZipInstance } from '@/lib/zip-cache';
import { parseComicInfo } from '@/lib/metadata-parser';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');

    if (!book) {
        return NextResponse.json({ error: 'Book parameter is required' }, { status: 400 });
    }

    const config = getConfig();
    const bookPath = path.join(config.libraryPath, book);

    if (!fs.existsSync(bookPath)) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    try {
        let xmlContent: string | null = null;
        const stats = fs.statSync(bookPath);

        if (stats.isDirectory()) {
            // Check for ComicInfo.xml in directory
            const xmlPath = path.join(bookPath, 'ComicInfo.xml');
            if (fs.existsSync(xmlPath)) {
                xmlContent = fs.readFileSync(xmlPath, 'utf-8');
            }
        } else if (/\.(zip|cbz)$/i.test(book)) {
            // Check for ComicInfo.xml in archive
            try {
                const zip = await getZipInstance(bookPath);
                const entry = await zip.entry('ComicInfo.xml');
                if (entry) {
                    const buffer = await zip.entryData('ComicInfo.xml');
                    xmlContent = buffer.toString('utf-8');
                }
            } catch (zipError) {
                console.warn(`Failed to read zip metadata for ${book}:`, zipError);
            }
        }

        if (!xmlContent) {
            return NextResponse.json({ bookName: book }); // Return empty metadata if not found
        }

        const metadata = await parseComicInfo(xmlContent, book);
        return NextResponse.json(metadata || { bookName: book });

    } catch (error) {
        console.error('Metadata fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
