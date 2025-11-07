@echo off
chcp 65001 >nul
echo ========================================
echo 反派逆袭系统 - 本地安装包准备工具
echo ========================================
echo.

REM 创建临时目录
set TEMP_DIR=villain-game-install
if exist %TEMP_DIR% rmdir /s /q %TEMP_DIR%
mkdir %TEMP_DIR%

echo [1/4] 复制核心文件...
copy index.html %TEMP_DIR%\
copy game.js %TEMP_DIR%\
copy style.css %TEMP_DIR%\
copy 反派逆袭系统指南.yaml %TEMP_DIR%\
copy 本地安装指南.md %TEMP_DIR%\

echo [2/4] 检查文件完整性...
if not exist %TEMP_DIR%\index.html (
    echo 错误: index.html 复制失败
    pause
    exit /b 1
)
if not exist %TEMP_DIR%\game.js (
    echo 错误: game.js 复制失败
    pause
    exit /b 1
)
if not exist %TEMP_DIR%\style.css (
    echo 错误: style.css 复制失败
    pause
    exit /b 1
)
if not exist %TEMP_DIR%\反派逆袭系统指南.yaml (
    echo 错误: YAML配置文件复制失败
    pause
    exit /b 1
)

echo [3/4] 创建安装说明...
echo 反派逆袭系统 - 本地安装包 > %TEMP_DIR%\README.txt
echo. >> %TEMP_DIR%\README.txt
echo 安装步骤: >> %TEMP_DIR%\README.txt
echo 1. 将此文件夹复制到 SillyTavern 的 public 目录下 >> %TEMP_DIR%\README.txt
echo    例如: SillyTavern\public\villain-game\ >> %TEMP_DIR%\README.txt
echo. >> %TEMP_DIR%\README.txt
echo 2. 在 SillyTavern 的世界书或角色卡中添加 iframe: >> %TEMP_DIR%\README.txt
echo    ^<iframe src="/villain-game/index.html" style="..."^>^</iframe^> >> %TEMP_DIR%\README.txt
echo. >> %TEMP_DIR%\README.txt
echo 详细说明请查看 本地安装指南.md >> %TEMP_DIR%\README.txt

echo [4/4] 安装包已准备完成!
echo.
echo 安装包位置: %cd%\%TEMP_DIR%\
echo.
echo 请将 %TEMP_DIR% 文件夹复制到 SillyTavern 的 public 目录下
echo 并重命名为 villain-game
echo.
echo ========================================
pause
