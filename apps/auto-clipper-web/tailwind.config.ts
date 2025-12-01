import type { Config } from "tailwindcss";
// 🔴 ADDED: 共通設定をインポート (もし設定されていなければ)
import sharedConfig from "@repo/config/tailwind.config";

const config: Config = {
    ...sharedConfig,
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        // 🔴 ADDED: UI パッケージを監視対象に追加
        "../../packages/ui/src/**/*.{ts,tsx}",
    ],
    presets: [sharedConfig],
};
export default config;
