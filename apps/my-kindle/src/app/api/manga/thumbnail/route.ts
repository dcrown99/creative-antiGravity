import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getConfig } from '@/lib/config';
import { getZipInstance } from '@/lib/zip-cache';

// Determine MIME type based on file extension
const getMimeType = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.webp':
            return 'image/webp';
        default:
            return 'application/octet-stream';
    }
};

interface ZipEntry {
    isDirectory: boolean;
    name: string;
}

/**
 * GET /api/manga/thumbnail
 * Supports two modes:
 * 1. Serve a file from a ZIP/CBZ archive when `archivePath` and `filePath` query params are provided.
 * 2. Fallback to serving the first image (cover) found in the book folder.
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const archivePath = searchParams.get('archivePath');
        const filePath = searchParams.get('filePath');

        // ---------- Mode 1: Serve a file from an archive ----------
        if (archivePath && filePath) {
            const config = getConfig();
            const fullArchivePath = path.join(config.libraryPath, archivePath);

            if (!fs.existsSync(fullArchivePath)) {
                return new NextResponse('Archive not found', { status: 404 });
            }

            try {
                const zip = await getZipInstance(fullArchivePath);
                const data = await zip.entryData(filePath);
                const mimeType = getMimeType(filePath);

                return new NextResponse(data, {
                    headers: {
                        'Content-Type': mimeType,
                        'Cache-Control': 'public, max-age=31536000, immutable',
                    },
                });
            } catch (e) {
                console.error(`Failed to extract ${filePath} from ${archivePath}:`, e);
                return new NextResponse('File not found in archive', { status: 404 });
            }
        }

        // ---------- Mode 2: Fallback  Eserve the first image in the book folder ----------
        const book = searchParams.get('book');
        if (!book) {
            return new NextResponse('Missing book parameter', { status: 400 });
        }

        const config = getConfig();
        const bookPath = path.join(config.libraryPath, book);
        if (!fs.existsSync(bookPath)) {
            return new NextResponse('Book not found', { status: 404 });
        }

        const files = fs.readdirSync(bookPath);

        // 2a. Try direct images
        const images = files
            .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        if (images.length > 0) {
            const imagePath = path.join(bookPath, images[0]);
            const buffer = fs.readFileSync(imagePath);
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': getMimeType(imagePath),
                    'Cache-Control': 'public, max-age=86400',
                },
            });
        }

        // 2b. Try images inside ZIP/CBZ archives
        const archives = files
            .filter((f) => /\.(zip|cbz)$/i.test(f))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        if (archives.length > 0) {
            // Check the first archive for images
            const firstArchive = archives[0];
            const fullArchivePath = path.join(bookPath, firstArchive);

            try {
                const zip = await getZipInstance(fullArchivePath);
                const entries = await zip.entries();

                // Find the first image file in the zip
                const imageEntries = Object.values(entries)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((entry: any) => {
                        const e = entry as ZipEntry;
                        return !e.isDirectory && /\.(jpg|jpeg|png|gif|webp)$/i.test(e.name);
                    })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((entry: any) => (entry as ZipEntry).name)
                    .sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                if (imageEntries.length > 0) {
                    const firstImage = imageEntries[0];
                    const data = await zip.entryData(firstImage);

                    return new NextResponse(data, {
                        headers: {
                            'Content-Type': getMimeType(firstImage),
                            'Cache-Control': 'public, max-age=86400',
                        },
                    });
                }
            } catch (e) {
                console.error(`Failed to read archive ${firstArchive} for thumbnail:`, e);
            }
        }

        return new NextResponse('No images found', { status: 404 });
    } catch (error) {
        console.error('Error serving thumbnail:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
