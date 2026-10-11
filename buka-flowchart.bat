@echo off
title USINDO - Flowchart Sistem Absensi Face Recognition
color 0B

echo ===================================================================
echo   USINDO (UNIVERSITAS SEHATI INDONESIA)
echo   MEMBUKA FLOWCHART SISTEM ABSENSI FACE RECOGNITION...
echo ===================================================================
echo.

cd /d "%~dp0"
start flowchart_usindo.html

echo Berhasil dibuka di browser!
timeout /t 2 /nobreak >nul
exit
