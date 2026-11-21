@echo off
title Hubungkan Ollama ke Vercel (Kelarin AI)
color 0b
cls
echo =======================================================================
echo          JEMBATAN OLLAMA (QWEN 2.5 3B) KE VERCEL (KELARIN AI)
echo =======================================================================
echo.
echo [1/2] Memeriksa status Ollama di laptop...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Ollama belum aktif. Memulai model qwen2.5:3b...
    start "" ollama run qwen2.5:3b
    timeout /t 3 >nul
) else (
    echo [OK] Ollama aktif di http://127.0.0.1:11434
)

echo.
echo [2/2] Membuka Tunnel HTTPS Gratis agar Vercel dapat terhubung...
echo.
echo =======================================================================
echo PETUNJUK PENGGUNAAN:
echo 1. Tunggu beberapa detik sampai muncul baris:
echo       your url is: https://xxxx.loca.lt
echo 2. Buka website Vercel Anda di: https://kelarin-eight.vercel.app
echo 3. Buka Kelarin AI, klik ikon Pengaturan (Gear) di kanan atas
echo 4. Salin dan tempel URL https://xxxx.loca.lt tersebut ke kolom "URL Ollama"
echo 5. Klik "Simpan & Terapkan"
echo.
echo PENTING: JANGAN TUTUP jendela hitam ini selama menggunakan AI di Vercel!
echo =======================================================================
echo.
npx --yes localtunnel --port 11434
pause
