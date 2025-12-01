import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getConfig } from '@/lib/config';
import { getZipInstance } from '@/lib/zip-cache';

const getMimeType = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        case '.gif': return 'image/gif';
        case '.webp': return 'image/webp';
        default: return 'application/octet-stream';
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const book = searchParams.get('book');
    const imageParam = searchParams.get('image'); // "Vol1.zip/001.jpg" or "001.jpg"

    if (!book || !imageParam) {
        return new NextResponse('Missing parameters', { status: 400 });
    }

    const config = getConfig();
    const BASE_DIR = config.libraryPath;
    const bookPath = path.join(BASE_DIR, book);

    try {
        // 繝代せ讀懆ｨｼ
        const relative = path.relative(BASE_DIR, bookPath);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            return new NextResponse('Access denied', { status: 403 });
        }

        // 0. Check if the book itself is an archive file (Root-level archive support)
        if (fs.existsSync(bookPath) && fs.statSync(bookPath).isFile()) {
            if (/\.(zip|cbz)$/i.test(bookPath)) {
                try {
                    const zip = await getZipInstance(bookPath);
                    const data = await zip.entryData(imageParam);
                    return new NextResponse(data, {
                        headers: {
                            'Content-Type': getMimeType(imageParam),
                            'Cache-Control': 'public, max-age=31536000, immutable',
                        },
                    });
                } catch (e) {
                    console.error(`Failed to extract ${imageParam} from ${book}:`, e);
                    return new NextResponse('Image not found in archive', { status: 404 });
                }
            }
        }

        // 1. 逶ｴ繝輔ぃ繧､繝ｫ縺ｨ縺励※蟄伜惠縺吶ｋ縺狗｢ｺ隱・(蠕梧婿莠呈鋤諤ｧ & 繝輔か繝ｫ繝逶ｴ荳九・逕ｻ蜒・
        const directPath = path.join(bookPath, imageParam);
        if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
            return new NextResponse(fs.readFileSync(directPath), {
                headers: {
                    'Content-Type': getMimeType(directPath),
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        // 2. ZIP蜀・・繝代せ縺ｨ縺励※隗｣譫・("Archive.zip/Path/To/Image.jpg")
        // 譛髟ｷ荳閾ｴ縺ｧZIP繝輔ぃ繧､繝ｫ蜷阪ｒ謗｢縺・
        if (fs.existsSync(bookPath)) {
            // 繝代Λ繝｡繝ｼ繧ｿ繧・"/" 縺ｧ蛻・牡縺励※縲∝・鬆ｭ縺九ｉZIP繝輔ぃ繧､繝ｫ蜷阪ｒ謗｢縺・
            // 萓・ "Vol1.zip/Chapter1/01.jpg" -> ["Vol1.zip", "Chapter1", "01.jpg"]
            const parts = imageParam.split('/');

            let archiveName = '';
            let internalPath = '';

            // 繝輔か繝ｫ繝蜀・・繝輔ぃ繧､繝ｫ荳隕ｧ繧貞叙蠕励＠縺ｦ縲∵怏蜉ｹ縺ｪZIP蜷阪→繝槭ャ繝√Φ繧ｰ
            const files = fs.readdirSync(bookPath);
            const archiveFiles = new Set(files.filter(f => /\.(zip|cbz)$/i.test(f)));

            // 繝代せ縺ｮ蜈磯ｭ驛ｨ蛻・′ZIP繝輔ぃ繧､繝ｫ蜷阪°繝√ぉ繝・け
            for (let i = 0; i < parts.length; i++) {
                const potentialName = parts.slice(0, i + 1).join('/');
                if (archiveFiles.has(potentialName)) {
                    archiveName = potentialName;
                    internalPath = parts.slice(i + 1).join('/');
                    break;
                }
            }

            if (archiveName && internalPath) {
                const archivePath = path.join(bookPath, archiveName);
                try {
                    const zip = await getZipInstance(archivePath);
                    const data = await zip.entryData(internalPath);

                    return new NextResponse(data, {
                        headers: {
                            'Content-Type': getMimeType(internalPath),
                            'Cache-Control': 'public, max-age=31536000, immutable',
                        },
                    });
                } catch (e) {
                    console.error(`Failed to extract ${internalPath} from ${archiveName}:`, e);
                }
            }
        }

        return new NextResponse('Image not found', { status: 404 });

    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
