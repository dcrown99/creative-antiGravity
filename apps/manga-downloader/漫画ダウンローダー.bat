@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d %~dp0

echo ================================================
echo    漫画ダウンローダー - Canvas Extractor
echo ================================================

REM --- 1. 仮想環境のセットアップと確認 ---
if not exist .venv (
    echo [初期設定] 仮想環境を作成しています...
    python -m venv .venv
    
    echo [初期設定] 仮想環境を有効化しています...
    call .venv\Scripts\activate

    echo [初期設定] ビルドツールを更新しています...
    python -m pip install --upgrade pip setuptools wheel

    echo [初期設定] ライブラリをインストールしています...
    REM キャッシュエラー回避のため --no-cache-dir を使用
    pip install --no-cache-dir -r requirements.txt
    
    echo [初期設定] ブラウザエンジンをインストールしています...
    playwright install chromium
) else (
    REM 既に存在する場合は有効化のみ行う
    call .venv\Scripts\activate
)

:MENU
echo.
echo ------------------------------------------------
echo オプション:
echo   1. URLを直接入力してダウンロード
echo   2. urls.txt から一括ダウンロード
echo   3. 終了
echo   4. ライブラリの強制再インストール（トラブル時用）
echo ------------------------------------------------
set /p choice=選択してください (1-4): 

if "!choice!"=="1" (
    echo.
    set /p url=ダウンロードするURLを入力してください: 
    if "!url!"=="" (
        echo [警告] URLが入力されていません。
    ) else (
        echo.
        echo [実行中] ダウンロードを開始します...
        python download_images_as_cbz.py "!url!"
    )
) else if "!choice!"=="2" (
    if exist urls.txt (
        echo.
        echo [実行中] urls.txt から一括ダウンロードを開始します...
        python download_images_as_cbz.py --file urls.txt
    ) else (
        echo.
        echo [エラー] urls.txt ファイルが見つかりません。
    )
) else if "!choice!"=="3" (
    echo.
    echo 終了します。
    exit /b 0
) else if "!choice!"=="4" (
    echo.
    echo [メンテナンス] ライブラリを再インストールします...
    python -m pip install --upgrade pip setuptools wheel
    pip install --no-cache-dir -r requirements.txt
    playwright install chromium
    echo [完了] 再インストールが完了しました。
) else (
    echo.
    echo [エラー] 無効な選択です。
)

echo.
pause
goto MENU