@echo off
title USINDO - Flowchart Sistem Absensi Face Recognition
color 0B

echo ===================================================================
echo   USINDO (UNIVERSITAS SEHATI INDONESIA)
echo   MEMBUKA FLOWCHART SISTEM ABSENSI FACE RECOGNITION...
echo ===================================================================
echo.

cd /d "%~dp0"
start "" "%~dp0flowchart_usindo.html"

echo Berhasil dibuka di browser!
ping 127.0.0.1 -n 3 >nul
exit
