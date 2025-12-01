@echo off
chcp 65001 >nul
title ショートカット作成

REM 現在のディレクトリを取得
set SCRIPT_DIR=%~dp0
set BAT_FILE=%SCRIPT_DIR%漫画ダウンローダー.bat

REM PowerShellでデスクトップの正しいパスを取得してショートカットを作成
powershell -ExecutionPolicy Bypass -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $WScriptShell = New-Object -ComObject WScript.Shell; $Shortcut = $WScriptShell.CreateShortcut([IO.Path]::Combine($desktop, '漫画ダウンローダー.lnk')); $Shortcut.TargetPath = '%BAT_FILE%'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.IconLocation = 'C:\Windows\System32\shell32.dll,42'; $Shortcut.Save(); Write-Host 'ショートカットを作成しました: ' $Shortcut.FullName"

if %ERRORLEVEL% EQU 0 (
    echo ================================================
    echo デスクトップにショートカットを作成しました！
    echo ショートカット名: 漫画ダウンローダー
    echo ================================================
) else (
    echo ================================================
    echo エラー: ショートカットの作成に失敗しました
    echo ================================================
)
echo.
pause
