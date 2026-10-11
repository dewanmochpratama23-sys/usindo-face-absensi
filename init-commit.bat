@echo off
set PATH=%~dp0mingit\cmd;%PATH%
git config user.name "Pengembang USINDO"
git config user.email "developer@usindo.ac.id"
git add .
git commit -m "Upload Sistem Absensi Biometrik Wajah USINDO - Data Fakhri Ready"
git branch -M main
git log -n 1 --oneline
