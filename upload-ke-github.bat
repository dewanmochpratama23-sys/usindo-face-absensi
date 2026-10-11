@echo off
title USINDO - Upload Otomatis ke GitHub
color 0A

echo ===============================================================================
echo     USINDO (UNIVERSITAS SEHATI INDONESIA)
echo     UPLOAD OTOMATIS SELURUH PROYEK KE GITHUB
echo ===============================================================================
echo.

set PATH=%~dp0mingit\cmd;%PATH%

cd /d "%~dp0"

echo [1/4] Menyiapkan Git Repository...
if not exist .git (
    git init
)
git config user.name "Pengembang USINDO"
git config user.email "developer@usindo.ac.id"

echo.
echo [2/4] Mengumpulkan file proyek (tanpa node_modules)...
git add .

echo.
echo [3/4] Menyimpan commit (termasuk data Fakhri yang sudah terdaftar)...
git commit -m "Upload Sistem Absensi Biometrik Wajah USINDO" >nul 2>&1
if %errorlevel% neq 0 (
    echo       File sudah tersimpan dalam commit sebelumnya.
) else (
    echo       Commit berhasil dibuat!
)

git branch -M main

set DEFAULT_URL=https://github.com/dewanmochpratama23-sys/usindo-face-absensi.git
echo.
echo ===============================================================================
echo  URL Repository GitHub Anda yang terdeteksi:
echo  %DEFAULT_URL%
echo ===============================================================================
echo.
set /p REPO_URL=">> Tekan ENTER langsung untuk mulai upload (atau paste URL lain): "
if "%REPO_URL%"=="" set REPO_URL=%DEFAULT_URL%

echo.
echo [4/4] Mengunggah file ke GitHub: %REPO_URL% ...
echo (Jika muncul jendela login GitHub, silakan klik 'Sign in with your browser')
echo.

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git push -u origin main --force

echo.
if %errorlevel% equ 0 (
    echo ===============================================================================
    echo  SELAMAT! PROYEK BERHASIL TERUNGGAH 100%% KE GITHUB!
    echo ===============================================================================
    echo.
    echo Sekarang Anda tinggal membuka Render.com dan menghubungkan repository ini.
) else (
    echo ===============================================================================
    echo  Upload belum selesai. Pastikan URL GitHub benar dan Anda sudah login.
    echo ===============================================================================
)
echo.
pause
