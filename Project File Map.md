# Project File Map

This document outlines the key file locations for the AI assistant to quickly navigate the codebase.

## 🛠 Core Configuration
- **Root Config:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`
- **Docker Orchestration:** `docker-compose.yml` (Main)
- **Ignore Files:** `.dockerignore` (Crucial for build context), `.gitignore`
- **Env:** `.env` (Root environment variables)

## 💰 App: Money Master (@app/money-master)
- **Location:** `apps/money-master`
- **Env:** `.env` (Database URL: `file:/app/apps/money-master/data/money-master.db`)
- **Database:**
  - Schema: `prisma/schema.prisma`
  - SQLite File: `data/money-master.db` (Mounted volume)
- **Logic:**
  - Actions: `src/lib/actions.ts` (Server Actions entry point)
  - Services: `src/services/*.ts` (Business logic & DB access)
  - Types: `src/types/index.ts`
- **UI:**
  - Pages: `src/app/**/*`
  - Components: `src/components/**/*` (Feature specific)

## 📚 App: My Kindle (@app/my-kindle)
- **Location:** `apps/my-kindle`
- **Config:** `src/lib/config.ts` (Library path logic)
- **API:** `src/app/api/**/*`
- **Mounts:** `/mnt/gdrive/Manga` (Google Drive)

## 🎬 App: Auto Clipper (@app/auto-clipper-web)
- **Frontend:** `apps/auto-clipper-web`
- **Backend (Python):`apps/auto-clipper-api`
  - Entry: `main.py` (FastAPI)
  - Worker: `celery_app.py`, `tasks.py` (Celery)
  - Config: `config.py`
  - Database: `database.py`, `jobs.db`
- **Generated Files:** `apps/auto-clipper-api/output`

## 📈 Service: Market Watcher
- **Location:** `apps/market-watcher`
- **Logic:** `src/analyst.py` (Gemini integration), `src/main.py`

## 📥 Tool: Manga Downloader
- **Location:** `apps/manga-downloader`
- **Type:** Standalone Python Script
- **Entry:** `download_images_as_cbz.py`
- **Docs:** `使い方.md`, `exe化手順.md`

## 📦 Shared Packages
- **UI Library:** `packages/ui`
  - Components: `src/components/ui/*.tsx` (Shadcn UI)
  - Utils: `src/lib/utils.ts` (`cn` helper)
  - Exports: `src/index.ts`
- **Config:** `packages/config`
  - ESLint: `eslint.config.mjs`
  - TypeScript: `tsconfig.json`

## 📜 Scripts (PowerShell Management)
- **Manager:** `scripts/dev_manager.ps1` (Main entry point: up, rebuild, logs)
- **Health:** `scripts/verify_system.ps1` (System health check)
- **Setup:** `scripts/setup_drive.ps1`, `scripts/launch_system.ps1`
- **Maintenance:** `scripts/cleanup_project.ps1`, `scripts/restart_docker.ps1`
- **Utils:** `scripts/sync_github.ps1`

## 🔍 Observability
- **Dozzle:** `localhost:8888` (Log Viewer)
- **Redis:** `localhost:6379` (Message Broker)
- **Voicevox:** `localhost:50021` (TTS Engine)