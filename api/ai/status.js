import { setCorsHeaders } from '../_db.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const customUrl = req.headers['x-ollama-url'] || req.query?.url || req.body?.url;
  const ollamaUrl = (customUrl || process.env.OLLAMA_URL || 'http://127.0.0.1:11434').trim().replace(/\/+$/, '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const targetUrl = `${ollamaUrl}/api/tags`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'bypass-tunnel-reminder': 'true',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Kelarin-Vercel-AI/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        online: true,
        url: ollamaUrl,
        models: (data.models || []).map((m) => m.name),
      });
    }

    return res.status(200).json({
      online: false,
      url: ollamaUrl,
      error: `Server merespons status ${response.status}`,
    });
  } catch (error) {
    return res.status(200).json({
      online: false,
      url: ollamaUrl,
      error: error.message || 'Koneksi gagal atau timeout',
    });
  }
}
