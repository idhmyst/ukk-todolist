import { setCorsHeaders } from '../_db.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Ambil URL Ollama dari header, body, atau default
  const customUrl = req.headers['x-ollama-url'] || req.body?.ollama_url;
  const ollamaUrl = (customUrl || process.env.OLLAMA_URL || 'http://127.0.0.1:11434').trim().replace(/\/+$/, '');

  const payload = {
    model: req.body?.model || 'qwen2.5:3b',
    messages: req.body?.messages || [],
    stream: false,
    format: req.body?.format || 'json',
    options: req.body?.options || { temperature: 0.2 },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const targetUrl = `${ollamaUrl}/api/chat`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Kelarin-Vercel-AI/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error connecting to Ollama at', ollamaUrl, error);
    return res.status(502).json({
      error:
        `Tidak dapat terhubung ke Ollama (${ollamaUrl}).\n\n` +
        `💡 Cara menghubungkan Ollama laptop Anda ke Vercel:\n` +
        `1. Jalankan 'hubungkan-ollama.bat' di laptop Anda.\n` +
        `2. Salin URL HTTPS yang muncul (contoh: https://xxxx.loca.lt).\n` +
        `3. Masukkan ke menu Pengaturan AI (ikon ⚙️ di samping nama asisten).\n\n` +
        `Atau beralih ke mode 'Gemini 2.5 Cloud'.`,
    });
  }
}
