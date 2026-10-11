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
echo [2/3] Memeriksa status Server Backend USINDO (Port 5000)...
curl.exe -s --connect-timeout 1 http://127.0.0.1:5000/api/health >nul 2>nul
if %errorlevel% equ 0 (
    echo       Server backend sudah AKTIF dan SIAP di port 5000!
) else (
    echo       Menyalakan Server Backend di latar belakang...
    cd /d "%~dp0server"
    start "USINDO Attendance Server" node server.js
    
    echo       Menunggu server siap...
    set /a attempts=0
:wait_loop
    timeout /t 1 /nobreak >nul
    set /a attempts+=1
    curl.exe -s --connect-timeout 1 http://127.0.0.1:5000/api/health >nul 2>nul
    if %errorlevel% neq 0 (
        if %attempts% lss 15 goto wait_loop
    )
    echo       Server backend berhasil terhubung!
)

echo.
echo [3/3] Membuka Portal Absensi di Browser...
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
