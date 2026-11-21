@echo off
title Hubungkan Ollama ke Vercel (Cloudflare Tunnel)
color 0b
cls
echo =======================================================================
echo          JEMBATAN OLLAMA (QWEN 2.5 3B) KE VERCEL CLOUD
echo                (Powered by Cloudflare Quick Tunnel)
echo =======================================================================
echo.
echo [1/2] Memeriksa status Ollama di laptop...
curl.exe -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Ollama belum aktif. Memulai model qwen2.5:3b...
    start "" ollama run qwen2.5:3b
    timeout /t 3 >nul
) else (
    echo [OK] Ollama aktif di http://127.0.0.1:11434!
)

echo.
echo [2/2] Membuka Tunnel HTTPS Cepat via Cloudflare...
echo.
echo =======================================================================
echo PETUNJUK:
echo 1. Tunggu beberapa detik sampai muncul kotak berisi link:
echo       https://xxxx.trycloudflare.com
echo 2. Salin link https://xxxx.trycloudflare.com tersebut
echo 3. Buka https://kelarin-eight.vercel.app di browser Anda
echo 4. Buka Kelarin AI, klik ikon Pengaturan (Gear) di kanan atas
echo 5. Tempel link tersebut ke kolom "URL Ollama / Tunnel"
echo 6. Klik "Tes" lalu "Simpan & Terapkan"
echo.
echo PENTING: JANGAN TUTUP jendela hitam ini selama menggunakan AI di Vercel!
echo =======================================================================
echo.
if exist "%~dp0cloudflared.exe" (
    "%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:11434 --http-host-header localhost
) else (
    curl.exe -L -s https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -o "%~dp0cloudflared.exe"
    "%~dp0cloudflared.exe" tunnel --url http://127.0.0.1:11434 --http-host-header localhost
)
pause
