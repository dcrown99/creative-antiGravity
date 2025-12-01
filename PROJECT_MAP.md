# 🗺️ プロジェクトマップ

## 📂 ルートディレクトリ
- `redeploy_all.ps1`: **Master Launch Script** (ワンクリック起動用)。
- `package.json`: ルート依存関係とワークスペース定義。
- `pnpm-workspace.yaml`: モノレポ構成定義。

## 📦 アプリケーション (`/apps`)

### 💰 `money-master` (Core)
- **スタック:** Next.js 15, Prisma, SQLite, Tailwind.
- **役割:** 中央ダッシュボード、資産管理。
- **主要ファイル:** `schema.prisma`, `docker-compose.yml`.

### 📚 `my-kindle` (Reader)
- **スタック:** Next.js 15, Tailwind.
- **役割:** ローカル漫画リーダー (Google Driveから配信)。
- **主要ファイル:** `docker-compose.yml`.

### 🎬 `auto-clipper-web` (UI)
- **スタック:** Next.js 15, React Query.
- **役割:** 動画編集用UI。
- **主要ファイル:** `docker-compose.yml`.

### ⚙️ `auto-clipper-api` (Backend)
- **スタック:** Python 3.11, FastAPI, Celery, FFmpeg.
- **役割:** 動画処理、YouTubeダウンロード。
- **主要ファイル:** `main.py`, `tasks.py`, `worker.py`, `docker-compose.yml`.

### 📈 `market-watcher` (AI Agent)
- **スタック:** Python 3.11, LangChain (予定), Voicevox.
- **役割:** 市場分析 & 音声レポート作成。
- **主要ファイル:** `analyst.py`, `docker-compose.yml`.

## 🧩 共有パッケージ (`/packages`)
- **`ui`**: 共有Reactコンポーネント (Radix UI, Shadcn)。
- **`config`**: 共有ESLint/TSConfig設定。
