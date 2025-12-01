import fs from 'fs';
import path from 'path';

// 設定ファイルのパス（プロジェクトルートに保存）
const CONFIG_PATH = path.join(process.cwd(), 'app-config.json');

export interface AppConfig {
    libraryPath: string;
}

// デフォルト設定
// Docker環境変数を最優先し、なければ従来のWindowsパスをフォールバックとして使用
const DEFAULT_CONFIG: AppConfig = {
    libraryPath: process.env.LIBRARY_PATH || process.env.MANGA_DIR || 'H:\\DL\\MangaDownloads',
};

/**
 * 設定を読み込みます。
 * 優先順位:
 * 1. 環境変数 (LIBRARY_PATH) - DriveStream Architecture
 * 2. 環境変数 (MANGA_DIR) - Legacy Docker
 * 3. app-config.json (ユーザー設定)
 * 4. デフォルト値
 */
export function getConfig(): AppConfig {
    // 1. デフォルト設定（環境変数含む）をベースにする
    let config = { ...DEFAULT_CONFIG };

    // 2. 設定ファイルがあれば読み込んで上書き（ユーザー設定の適用）
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
            const parsed = JSON.parse(data);

            // 設定ファイルの内容で上書き
            config = { ...config, ...parsed };
        }
    } catch (error) {
        console.error(`[Config] Failed to read config from ${CONFIG_PATH}:`, error);
        // エラーでもアプリを止めず、現在のconfigを維持
    }

    // 3. 重要: Docker環境での環境変数強制適用
    // 設定ファイルに古いローカルパスが残っていても、Docker運用時は環境変数を絶対優先とする
    if (process.env.LIBRARY_PATH) {
        config.libraryPath = process.env.LIBRARY_PATH;
    } else if (process.env.MANGA_DIR) {
        config.libraryPath = process.env.MANGA_DIR;
    }

    return config;
}

/**
 * 設定を保存します。
 */
export function saveConfig(newConfig: Partial<AppConfig>): AppConfig {
    try {
        // 現在の設定を取得
        const current = getConfig();
        const updated = { ...current, ...newConfig };

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
        console.log(`[Config] Saved to ${CONFIG_PATH}`);
        return updated;
    } catch (error) {
        console.error(`[Config] Failed to save config to ${CONFIG_PATH}:`, error);
        throw error;
    }
}