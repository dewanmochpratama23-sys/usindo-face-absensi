@echo off
title USINDO - Sistem Absensi Face Recognition
color 0B

echo ===============================================================================
echo     USINDO (UNIVERSITAS SEHATI INDONESIA)
echo     SISTEM ABSENSI BIOMETRIK WAJAH REAL-TIME (FACE RECOGNITION AI)
echo ===============================================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan install Node.js dari https://nodejs.org/ terlebih dahulu.
    pause
    exit /b
)

:: 1. Cek apakah server backend sudah aktif di port 5000
curl.exe -s --connect-timeout 1 http://127.0.0.1:5000/api/health >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Server backend USINDO sudah aktif di port 5000.
    goto buka_browser
)

:: 2. Jika belum aktif, jalankan server di jendela terpisah
echo [1/2] Menyalakan Server Backend USINDO...
cd /d "%~dp0server"
start "USINDO Attendance Server" cmd /k "node server.js"

echo [..] Menunggu server siap memuat sistem...
:tunggu_server
ping 127.0.0.1 -n 2 >nul
curl.exe -s --connect-timeout 1 http://127.0.0.1:5000/api/health >nul 2>nul
if %errorlevel% neq 0 goto tunggu_server

echo [OK] Server backend USINDO berhasil aktif!

:buka_browser
echo [2/2] Membuka Portal Absensi di Browser...
start "" http://localhost:5000

echo.
echo ===============================================================================
echo  APLIKASI BERHASIL DIJALANKAN!
echo.
echo  * Akses di Komputer Ini  : http://localhost:5000
echo  * Kata Sandi Semua Akun  : usindomaju01
echo.
echo  PANDUAN LOGIN:
echo  - Mahasiswa : Masukkan NIM masing-masing (contoh: 240131009, 240131012, dll)
echo  - Dosen     : NIP 19850101 (Bapak ANDRIYANA S.T., M.Kom.)
echo  - Admin     : admin (Biro BAAK USINDO)
echo ===============================================================================
echo.
echo Jendela server backend USINDO aktif berjalan di latar belakang.
ping 127.0.0.1 -n 3 >nul
exit
