# 🏗️ システムアーキテクチャ (Antigravity Ultimate Edition)

## 📊 概要
本システムは、5つの独立したComposeファイルによって管理される9つのコンテナを持つ **分散Dockerアーキテクチャ** で動作します。

```mermaid
graph TD
    subgraph Host ["Windows Host (G: Drive Mounted)"]
        Browser
        SQLite["dev.db (共有)"]
        GDrive["Google Drive (メディア)"]
    end

    subgraph Core_Group ["Core Group"]
        MM["money-master (:3001)"]
        Dozzle["log_viewer (:8888)"]
    end

    subgraph Kindle_Group ["Kindle Group"]
        Kindle["my-kindle (:3002)"]
    end

    subgraph Web_Group ["Web Group"]
        Web["auto-clipper-web (:3003)"]
    end

    subgraph API_Group ["API Group (Python)"]
        API["auto-clipper-api (:8000)"]
        Worker["auto-clipper-worker"]
        Redis["redis (:6379)"]
    end

    subgraph Market_Group ["Market AI Group"]
        Watcher["market-watcher (:8001)"]
        Voicevox["voicevox (:50021)"]
    end

    %% Connections
    Browser --> MM
    Browser --> Kindle
    Browser --> Web
    Browser --> API
    Browser --> Watcher
    Browser --> Dozzle

    Web -->|HTTP Fetch| API
    API -->|Task| Redis
    Redis -->|Consume| Worker
    
    Watcher -->|Read-Only| SQLite
    MM -->|Read-Write| SQLite
    Watcher -->|Audio Gen| Voicevox

    Kindle -->|Mount| GDrive
    API -->|Mount| GDrive
    Worker -->|Mount| GDrive
```

## 🔌 ポートレジストリ (予約済み)

| ポート | サービス | タイプ | プロトコル |
|--------|----------|--------|------------|
| **3001** | money-master | App | HTTP |
| **3002** | my-kindle | App | HTTP |
| **3003** | auto-clipper-web | App | HTTP |
| **8000** | auto-clipper-api | API | HTTP (FastAPI) |
| **8001** | market-watcher | API | HTTP (FastAPI) |
| **8888** | dozzle | Tool | HTTP |
| **6379** | redis | Infra | TCP |
| **50021** | voicevox | AI | HTTP |

## 📂 データ永続化戦略

- **データベース**: SQLite (`apps/money-master/prisma/dev.db`) を各コンテナにマウント。
- **メディア**: ホストの `G:/マイドライブ` を `/app/output`, `/app/library` にマウント。
- **クッキー**: `apps/auto-clipper-api/cookies.txt` (YouTubeアクセスに必須)。
