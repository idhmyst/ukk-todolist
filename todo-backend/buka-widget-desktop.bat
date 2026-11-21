@echo off
title Kelarin Desktop Widget Launcher
echo ====================================================
echo  Menjalankan Kelarin Desktop Widget (Dynamic Notch)
echo ====================================================
echo.
echo Pastikan server backend dan frontend sudah aktif:
echo - Backend: http://localhost:8080
echo - Frontend: http://localhost:5173
echo.
echo Membuka widget melayang di desktop...
start msedge --app="http://localhost:5173/?mode=widget" --window-size=920,240 --window-position=300,0
echo Selesai! Widget kini melayang di bagian atas layar desktop.

