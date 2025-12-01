import StreamZip from 'node-stream-zip';
import { LRUCache } from 'lru-cache';

// 開いたZIPファイルを一時的に保持するキャッシュ (LRU)
// Key: ファイルパス, Value: ZIPインスタンス
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const zipCache = new LRUCache<string, any>({
    max: 20, // 最大20ファイルまで保持
    dispose: (zip) => {
        try {
            console.log('Closing zip file due to eviction/cleanup');
            zip.close();
        } catch (e) {
            console.error('Failed to close zip:', e);
        }
    }
});

/**
 * ZIPインスタンスを取得します。
 * キャッシュにあればそれを返し、なければ新規作成してキャッシュします。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getZipInstance = async (filePath: string): Promise<any> => {
    // キャッシュヒット
    if (zipCache.has(filePath)) {
        return zipCache.get(filePath)!;
    }

    // 新規オープン
    const zip = new StreamZip.async({ file: filePath });

    // エラーハンドリングなどを考慮し、キャッシュに保存
    zipCache.set(filePath, zip);

    return zip;
};

/**
 * (オプション) キャッシュをクリアする場合に使用
 */
export const clearZipCache = () => {
    zipCache.clear();
};
