interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// 繝・ヵ繧ｩ繝ｫ繝医・繧ｭ繝｣繝・す繝･譛牙柑譛滄剞 (5蛻・
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * 繧ｭ繝｣繝・す繝･縺九ｉ繝・・繧ｿ繧貞叙蠕励＠縺ｾ縺吶・
 * 譛牙柑譛滄剞蛻・ｌ縺ｮ蝣ｴ蜷医・ null 繧定ｿ斐＠縺ｾ縺吶・
 */
export const getCache = <T>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > DEFAULT_TTL_MS) {
        cache.delete(key);
        return null;
    }

    return entry.data as T;
};

/**
 * 繝・・繧ｿ繧偵く繝｣繝・す繝･縺ｫ菫晏ｭ倥＠縺ｾ縺吶・
 */
export const setCache = <T>(key: string, data: T): void => {
    cache.set(key, {
        data,
        timestamp: Date.now(),
    });
};

/**
 * 迚ｹ螳壹・繧ｭ繝ｼ縲√∪縺溘・蜈ｨ縺ｦ縺ｮ繧ｭ繝｣繝・す繝･繧偵け繝ｪ繧｢縺励∪縺吶・
 */
export const clearCache = (key?: string): void => {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
};
