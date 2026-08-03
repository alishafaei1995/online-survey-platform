@echo off
chcp 65001 >nul
title اعمال آپدیت سامانه نظرسنجی
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply-update.ps1" -ZipPath "%~1"
