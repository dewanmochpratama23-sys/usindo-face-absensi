@echo off
title USINDO - Link Akses Online untuk Teman
color 0B

echo ===============================================================================
echo     USINDO (UNIVERSITAS SEHATI INDONESIA)
echo     MEMBUAT LINK AKSES ONLINE (HTTPS) UNTUK TEMAN-TEMAN
echo ===============================================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan install Node.js dari https://nodejs.org/ terlebih dahulu.
    pause
    exit /b
)

:: Bebaskan port 5000 jika ada proses zombie yang tertinggal
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>nul

cd /d "%~dp0"
node server\tunnel.js
pause
