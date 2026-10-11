@echo off
title USINDO - Link Akses Online untuk Teman
color 0B

cd /d "%~dp0"

node server\tunnel.js
pause
