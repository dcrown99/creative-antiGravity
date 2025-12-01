# Antigravity Migration Script v2 (Safe Mode)
# 目的: アプリ内のローカルUIインポートを @repo/ui に一括置換する（相対パス対応・バックアップ付き）
# 対象: money-master, my-kindle 等の Next.js アプリ

param (
    [string]$TargetApp = "apps/money-master"
)

$ScriptDir = $PSScriptRoot
if (-not $ScriptDir) { $ScriptDir = Get-Location }

$AppPath = Join-Path -Path $ScriptDir -ChildPath "..\$TargetApp"
$AppPath = $AppPath -replace '\\', '/' # Normalize for consistency
if (-not (Test-Path $AppPath)) {
    Write-Error "Target app not found: $AppPath"
    exit 1
}

$AppPath = (Resolve-Path $AppPath).Path
Write-Host "🚀 Starting migration for $TargetApp at $AppPath..." -ForegroundColor Cyan

# 0. 安全のためのバックアップ作成
$BackupPath = "$AppPath/src_backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item -Path "$AppPath/src" -Destination $BackupPath -Recurse
Write-Host "💾 Backup created at: $BackupPath" -ForegroundColor Yellow

# 1. ソースコード内の import 文を置換
$SrcPath = Join-Path $AppPath "src"
if (-not (Test-Path $SrcPath)) {
    Write-Error "Source directory not found: $SrcPath"
    exit 1
}

$files = Get-ChildItem -Path $SrcPath -Recurse -Include *.tsx, *.ts

foreach ($file in $files) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $originalContent = $content
        
        # パターン1: エイリアスパス "@/components/ui/..." -> "@repo/ui"
        if ($content -match 'from\s+["'']@/components/ui/.*["'']') {
            $content = $content -replace 'from\s+["'']@/components/ui/.*["'']', 'from "@repo/ui"'
        }

        # パターン2: 相対パス "../components/ui/..." (階層不問) -> "@repo/ui"
        # 誤爆防止: "components/ui" という並びが含まれる相対パスのみ対象
        if ($content -match 'from\s+["''].*\/components/ui/.*["'']') {
            $content = $content -replace 'from\s+["''].*\/components/ui/.*["'']', 'from "@repo/ui"'
        }
        
        # 変更があった場合のみ保存
        if ($content -ne $originalContent) {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            Write-Host "  UPDATED: $($file.Name)" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "Failed to process $($file.Name): $_"
    }
}

# 2. UIディレクトリのリネーム (削除はビルド成功確認後に手動で行う)
$UiDir = Join-Path $SrcPath "components\ui"
if (Test-Path $UiDir) {
    $DeprecatedName = Join-Path $SrcPath "components\ui_deprecated"
    # 既に存在する場合は一旦削除
    if (Test-Path $DeprecatedName) { Remove-Item -Recurse -Force $DeprecatedName }
    
    Rename-Item -Path $UiDir -NewName "ui_deprecated"
    Write-Host "📦 Renamed 'ui' folder to 'ui_deprecated'." -ForegroundColor Yellow
    Write-Host "👉 Action Required: Run 'pnpm build'. If successful, delete 'ui_deprecated' manually." -ForegroundColor Yellow
}
else {
    Write-Host "ℹ️  'src/components/ui' folder not found. Maybe already migrated?" -ForegroundColor Gray
}

Write-Host "✅ Migration finished. Verify with 'pnpm turbo run build --filter=$($TargetApp -replace 'apps/', '')'" -ForegroundColor Cyan
