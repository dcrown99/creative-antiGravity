<#
.SYNOPSIS
    Antigravity Development Manager
.DESCRIPTION
    サービスのスマートリビルド、ログ監視、システムメンテナンスを一元管理します。
    Windows環境特有のポーリング設定もサポートします。
#>

param (
    [string]$Action = "status",
    [string]$Service = "",
    [switch]$Poll = $false
)

$DockerComposeFile = "docker-compose.yml"

# 色付き出力ヘルパー
function Log-Info { param([string]$msg) Write-Host "INFO: $msg" -ForegroundColor Cyan }
function Log-Success { param([string]$msg) Write-Host "SUCCESS: $msg" -ForegroundColor Green }
function Log-Warn { param([string]$msg) Write-Host "WARN: $msg" -ForegroundColor Yellow }

function Show-Usage {
    Write-Host "Usage: ./dev_manager.ps1 [Action] [Service] [-Poll]"
    Write-Host "Actions:"
    Write-Host "  up        : Start all services"
    Write-Host "  rebuild   : Smart rebuild specific service (uses Turbo/Cache)"
    Write-Host "  logs      : Tail logs"
    Write-Host "  prune     : Clean Docker system"
    Write-Host "  status    : Show containers"
    Write-Host "Options:"
    Write-Host "  -Poll     : Enable HMR polling (for Windows file share issues)"
}

# 環境変数の設定 (Polling)
if ($Poll) {
    Log-Info "Enabling Watchpack Polling for Windows compatibility..."
    $env:WATCHPACK_POLLING = "true"
}
else {
    $env:WATCHPACK_POLLING = "false"
}

function Smart-Rebuild {
    param ([string]$TargetService)

    if ([string]::IsNullOrEmpty($TargetService)) {
        Log-Info "Rebuilding ALL services..."
        docker-compose -f $DockerComposeFile build
        docker-compose -f $DockerComposeFile up -d
    }
    else {
        Log-Info "Smart Rebuild for: $TargetService"
        
        # 停止 & 削除
        docker-compose -f $DockerComposeFile stop $TargetService
        docker-compose -f $DockerComposeFile rm -f $TargetService

        # ビルド (キャッシュ活用)
        Log-Info "Building with Docker BuildKit..."
        docker-compose -f $DockerComposeFile build $TargetService

        # 起動
        Log-Success "Starting service..."
        docker-compose -f $DockerComposeFile up -d --no-deps $TargetService
    }
}

switch ($Action) {
    "up" {
        docker-compose -f $DockerComposeFile up -d
    }
    "down" {
        docker-compose -f $DockerComposeFile down
    }
    "rebuild" {
        Smart-Rebuild -TargetService $Service
    }
    "logs" {
        if ([string]::IsNullOrEmpty($Service)) {
            docker-compose -f $DockerComposeFile logs -f
        }
        else {
            docker-compose -f $DockerComposeFile logs -f $Service
        }
    }
    "status" {
        docker-compose -f $DockerComposeFile ps
    }
    "prune" {
        Log-Warn "Pruning build cache and stopped containers..."
        docker system prune -f
    }
    Default {
        Show-Usage
    }
}
