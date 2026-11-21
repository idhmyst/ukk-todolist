import { setCorsHeaders } from '../_db.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(`${ollamaUrl.replace(/\/+$/, '')}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error:
        'Tidak dapat terhubung ke Ollama di ' +
        ollamaUrl +
        '. Jika menggunakan Vercel Cloud, pastikan model AI beralih ke Gemini atau jalankan frontend secara lokal.',
    });
  }
}
