@echo off
title USINDO - Sistem Absensi Face Recognition
color 0B

echo ===============================================================================
echo     USINDO (UNIVERSITAS SEHATI INDONESIA)
echo     SISTEM ABSENSI BIOMETRIK WAJAH REAL-TIME (FACE RECOGNITION AI)
echo ===============================================================================
echo.
echo [1/3] Memeriksa instalasi Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan install Node.js dari https://nodejs.org/ terlebih dahulu.
    pause
    exit /b
)
echo       Node.js terdeteksi: OK!
echo.
echo [2/3] Menjalankan Server Backend USINDO (Port 5000)...
cd /d "%~dp0server"
start "USINDO Attendance Server" node server.js

echo.
echo [3/3] Membuka Portal Absensi di Browser...
timeout /t 2 /nobreak >nul
start http://localhost:5000

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
echo Jangan tutup jendela server yang terbuka di latar belakang selama sistem digunakan.
pause
