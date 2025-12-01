# Antigravity Ultimate Monorepo

**"dcrown99-code"** は、Gemini 3 Pro (Antigravity Ultimate Edition) によって管理される、高性能アプリケーションスイートを含む本番グレードのモノレポです。

## 🏗️ アーキテクチャ

このプロジェクトは、高性能なビルドシステムとして **TurboRepo** を、コンテナ化環境として **Docker** を使用しています。

### 📦 アプリケーション一覧
| アプリ名 | 説明 | 技術スタック | ステータス | アクセス |
| :--- | :--- | :--- | :--- | :--- |
| **money-master** | 資産管理ダッシュボード | Next.js, Prisma | 🟢 Prod | [http://localhost:3000](http://localhost:3000) |
| **my-kindle** | セルフホスト型マンガリーダー | Next.js, FileSystem | 🟢 Prod | [http://localhost:3001](http://localhost:3001) |
| **auto-clipper** | 動画処理 AI エージェント | Next.js, FastAPI | 🟡 Active | [http://localhost:3002](http://localhost:3002) |
| **manga-downloader** | レガシー収集ツール | Python, Playwright | ⏸️ Legacy | (手動実行) |

---

## 🚀 クイックスタート (One-Click)

前提条件: **Docker Desktop (Windows)**, **Node.js 20+**, **pnpm 9+**.

### 1. 初期設定
Windows上でGoogle Driveがマウントされていることを確認してください (例: `G:` ドライブ)。

```bash
# ローカル依存関係のインストール
pnpm install

# 環境変数のセットアップ (例をコピー)
Copy-Item apps/money-master/env.example apps/money-master/.env
Copy-Item apps/auto-clipper-api/env.example apps/auto-clipper-api/.env
# (必要に応じて他のアプリも同様に)
```

### 2. ドライブマッピング設定 (重要)
`docker-compose.yml` を開き、ボリュームパスをローカルのGoogle Driveパスに合わせて更新してください。

```yaml
# docker-compose.yml の変更例
- "G:/マイドライブ/Clips:/mnt/gdrive"
```

### 3. システム起動
コンテナをビルドし、スタックを起動します。

```powershell
./scripts/restart_docker.ps1 -Rebuild
```

### 4. システム健全性確認
Gold Master検証スクリプトを実行し、全アプリのLint、型チェック、ビルドを確認します。

```powershell
./scripts/verify_gold_master.ps1
```

---

## 🛠️ 開発ワークフロー

### 📦 Docker内でのパッケージ管理
`node_modules` はコンテナの状態を保持するためにボリュームマウントされているため、ホスト側でのパッケージインストールは自動的にコンテナに反映されません。

**新しいパッケージを追加する場合:**
1. ホスト側で `pnpm add <package>` を実行 (package.jsonを更新)。
2. `./scripts/restart_docker.ps1 -Rebuild` を実行してコンテナに焼き込む。
   *(緊急時の修正: `docker compose exec <service> pnpm install`)*

### 🎨 UIコンポーネント開発
コンポーネントの独立開発には Storybook を使用します。

```bash
cd packages/ui
pnpm storybook
```

### 🗄️ データベースマイグレーション
`money-master` で `schema.prisma` を変更した場合:

```bash
cd apps/money-master
npx prisma migrate dev --name <migration_name>
```

---

## 📜 ライセンス & メンテナンス
Gemini 3 Pro (Antigravity Ultimate Edition) によって保守されています。アーキテクチャの背景については `@AI_STATUS.md` および `ADR.md` を参照してください。
