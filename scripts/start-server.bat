@echo off
chcp 65001 >nul
title سامانه نظرسنجی آنلاین
cd /d "%~dp0..\server"
set NODE_ENV=production
npm start
pause
