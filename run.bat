@echo off
title USINDO - Sistem Absensi Face Recognition
color 0B

echo ===============================================================================
echo     USINDO (UNIVERSITAS SEHATI INDONESIA)
echo     SISTEM ABSENSI BIOMETRIK WAJAH REAL-TIME (FACE RECOGNITION AI)
echo ===============================================================================
echo.

echo [1/3] Memeriksa Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan install Node.js dari https://nodejs.org/ terlebih dahulu.
    pause
    exit /b
)
echo       Node.js: OK!
echo.

echo [2/3] Membuka browser ke http://localhost:5000 ...
start "" http://localhost:5000

echo.
echo [3/3] Menjalankan Server Backend USINDO di Port 5000...
echo ===============================================================================
echo  PANDUAN LOGIN:
echo  - Mahasiswa : Masukkan NIM (contoh: 240131009, 240131012, dll)
echo  - Dosen     : NIP 19850101 (Bapak ANDRIYANA S.T., M.Kom.)
echo  - Admin     : admin (Biro BAAK USINDO)
echo  - Kata Sandi Semua Akun: usindomaju01
echo ===============================================================================
echo.

curl.exe -s --connect-timeout 1 http://127.0.0.1:5000/api/health >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Server backend USINDO SUDAH AKTIF di port 5000!
    echo Aplikasi siap digunakan di browser kamu: http://localhost:5000
    echo.
    echo Jendela ini jangan ditutup selama menggunakan aplikasi.
    pause
    exit /b
)

echo Menyalakan server... Jendela ini jangan ditutup selama aplikasi digunakan.
echo.
cd /d "%~dp0server"
node server.js
pause
