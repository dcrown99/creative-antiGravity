import { parseStringPromise } from 'xml2js';
import { BookMetadata } from '@/types';

export async function parseComicInfo(xmlContent: string, bookName: string): Promise<BookMetadata | null> {
    try {
        const result = await parseStringPromise(xmlContent, {
            explicitArray: false,
            ignoreAttrs: true,
            normalize: true,
        });

        const info = result.ComicInfo;
        if (!info) return null;

        return {
            bookName,
            title: info.Title,
            series: info.Series,
            volume: info.Number,
            summary: info.Summary,
            author: info.Writer,
            artist: info.Penciller,
            genre: info.Genre,
            pageCount: info.PageCount ? parseInt(info.PageCount, 10) : undefined,
            publisher: info.Publisher,
        };
    } catch (error) {
        console.error('Failed to parse ComicInfo.xml:', error);
        return null;
    }
}
