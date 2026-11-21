/**
 * aiService.js
 * Layanan integrasi AI untuk Kelarin:
 * Mendukung AI Lokal Ollama (Qwen 2.5 3B) TANPA butuh API Key,
 * serta Google Gemini (Cloud) jika diinginkan.
 */

export function getAiProvider() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kelarin_ai_provider');
    if (saved) return saved;
  }
  return import.meta.env.VITE_AI_PROVIDER || 'ollama';
}

export function setAiProvider(provider) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kelarin_ai_provider', provider);
  }
}

export function getOllamaConfig() {
  return {
    url:
      (typeof window !== 'undefined' ? localStorage.getItem('kelarin_ollama_url') : '') ||
      import.meta.env.VITE_OLLAMA_URL ||
      'http://localhost:11434',
    model:
      (typeof window !== 'undefined' ? localStorage.getItem('kelarin_ollama_model') : '') ||
      import.meta.env.VITE_OLLAMA_MODEL ||
      'qwen2.5:3b',
  };
}

export function setOllamaConfig(url, model) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('kelarin_ollama_url', url);
    if (model) localStorage.setItem('kelarin_ollama_model', model);
  }
}

export function getGeminiApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('kelarin_gemini_api_key') : '') ||
    ''
  );
}

export function setGeminiApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('kelarin_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('kelarin_gemini_api_key');
    }
  }
}

/**
 * Cek apakah Ollama lokal aktif dan merespons
 */
export async function checkOllamaStatus() {
  const { url } = getOllamaConfig();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${url}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { online: true, models: (data.models || []).map((m) => m.name) };
    }
    return { online: false, models: [] };
  } catch {
    return { online: false, models: [] };
  }
}

/**
 * Membersihkan simbol markdown yang mengganggu (seperti **, *, _, #, dll)
 */
export function stripMarkdownSymbols(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .trim();
}

/**
 * Format tanggal dan waktu lokal saat ini dalam bahasa Indonesia
 */
function getCurrentDateTimeContext() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = daysIndo[now.getDay()];
  const monthName = monthsIndo[now.getMonth()];

  return {
    isoDate: `${year}-${month}-${day}`,
    isoDateTime: `${year}-${month}-${day}T${hours}:${minutes}`,
    readable: `${dayName}, ${day} ${monthName} ${year} pukul ${hours}:${minutes} WIB`,
    year,
    month,
    day,
    hours,
    minutes,
  };
}

/**
 * Buat instruksi sistem yang tajam dan terstruktur
 */
function buildSystemInstruction(dt, activeTodosSummary) {
  return `Kamu adalah "Kelarin AI", asisten pintar, ramah, dan proaktif di dalam aplikasi To-Do List modern "Kelarin".

KONTEKS WAKTU SISTEM SAAT INI:
- Waktu Lokal: ${dt.readable}
- Format Tanggal Hari Ini (ISO): ${dt.isoDate}
- Format Tanggal & Jam Sekarang (ISO): ${dt.isoDateTime}

DAFTAR TUGAS PENGGUNA SAAT INI:
${activeTodosSummary || '(Belum ada tugas)'}

TUGAS UTAMAMU:
1. Membantu pengguna menambahkan tugas baru melalui perintah bahasa alami (natural language).
   - Pengguna bisa meminta dalam bahasa Indonesia santai atau formal, misalnya:
     * "Besok jam 9 pagi tolong ingatkan bikin laporan, prioritas high, notif 30 menit"
     * "Tambahkan tugas cuci motor nanti sore jam 17:00"
2. Membantu menjawab pertanyaan tentang tugas pengguna (misal: "Apa tugas yang paling mendesak?").

ATURAN EKSTRAKSI TUGAS (action: "create_todos"):
- Jika pengguna meminta menambahkan satu atau beberapa tugas, ekstrak ke dalam array "todos".
- Tiap item dalam "todos" HARUS memiliki properti:
  * "title": String nama tugas ringkas, jelas, huruf kapital di awal.
  * "priority": Salah satu dari "high" | "medium" | "low". Default ke "medium" jika tidak disebut secara spesifik.
  * "due_date": String ISO format "YYYY-MM-DDTHH:mm".
    - Jika pengguna menyebut "besok jam 9 pagi", hitung tanggal besok dari tanggal sistem ${dt.isoDate} dan format "YYYY-MM-DDT09:00".
    - Jika pengguna menyebut "lusa", tambahkan 2 hari dari tanggal sistem.
    - Jika pengguna menyebut "nanti sore jam 17:00", gunakan tanggal hari ini ${dt.isoDate} dan jam 17:00.
    - Jika pengguna tidak menyebut jam, default ke jam "23:59".
  * "reminder": Salah satu dari "1h" | "30m" | "5m" | "none". Default ke "30m" jika ada due_date, atau "none" jika tidak ditentukan.

FORMAT OUTPUT WAJIB (JSON murni tanpa markdown):
{
  "reply": "Pesan balasan sangat singkat (cukup 1 kalimat pendek, to the point)",
  "action": "create_todos" atau "chat",
  "todos": [
    {
      "title": "Judul Tugas",
      "priority": "high" | "medium" | "low",
      "due_date": "YYYY-MM-DDTHH:mm",
      "reminder": "1h" | "30m" | "5m" | "none"
    }
  ]
}`;
}

/**
 * Eksekusi perintah menggunakan Ollama Lokal (Qwen 2.5 3B)
 */
export async function sendOllamaCommand(userPrompt, currentTodos = [], chatHistory = []) {
  const { url, model } = getOllamaConfig();
  const dt = getCurrentDateTimeContext();

  const activeTodosSummary = currentTodos
    .slice(0, 15)
    .map((t) => {
      const status = t.is_completed ? 'Selesai' : 'Belum Selesai';
      const due = t.due_date ? `Tenggat: ${t.due_date}` : 'Tanpa tenggat';
      return `- [ID:${t.id}] ${t.title} (Prioritas: ${t.priority}, ${status}, ${due}, Reminder: ${t.reminder || 'none'})`;
    })
    .join('\n');

  const systemInstruction = buildSystemInstruction(dt, activeTodosSummary);

  const messages = [
    { role: 'system', content: systemInstruction },
  ];

  chatHistory.slice(-4).forEach((h) => {
    messages.push({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: typeof h.text === 'string' ? h.text : JSON.stringify(h.text),
    });
  });

  messages.push({ role: 'user', content: userPrompt });

  let response;
  try {
    response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.2,
        },
      }),
    });
  } catch (err) {
    throw new Error(
      `Tidak dapat terhubung ke Ollama (${url}). Pastikan aplikasi Ollama berjalan di laptop Anda (buka aplikasi Ollama atau jalankan 'ollama run ${model}' di terminal).`
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Ollama gagal merespons (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.message?.content;

  if (!rawText) {
    throw new Error('Tidak ada respons teks yang diterima dari Ollama Qwen.');
  }

  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    return {
      reply: stripMarkdownSymbols(parsed.reply) || 'Tugas telah disiapkan.',
      action: parsed.action || (parsed.todos?.length > 0 ? 'create_todos' : 'chat'),
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
    };
  } catch (parseErr) {
    console.error('Gagal mem-parse JSON dari Ollama:', rawText, parseErr);
    return {
      reply: stripMarkdownSymbols(rawText) || 'Perintah berhasil diproses.',
      action: 'chat',
      todos: [],
    };
  }
}

/**
 * Eksekusi perintah menggunakan Google Gemini API
 */
export async function sendGeminiCommand(userPrompt, currentTodos = [], chatHistory = []) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API Key belum dikonfigurasi.');
  }

  const dt = getCurrentDateTimeContext();

  const activeTodosSummary = currentTodos
    .slice(0, 15)
    .map((t) => {
      const status = t.is_completed ? 'Selesai' : 'Belum Selesai';
      const due = t.due_date ? `Tenggat: ${t.due_date}` : 'Tanpa tenggat';
      return `- [ID:${t.id}] ${t.title} (Prioritas: ${t.priority}, ${status}, ${due}, Reminder: ${t.reminder || 'none'})`;
    })
    .join('\n');

  const systemInstruction = buildSystemInstruction(dt, activeTodosSummary);

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }],
    },
    {
      role: 'model',
      parts: [
        {
          text: JSON.stringify({
            reply: 'Siap! Saya Kelarin AI. Mau catat atau cek tugas apa?',
            action: 'chat',
            todos: [],
          }),
        },
      ],
    },
  ];

  chatHistory.slice(-6).forEach((h) => {
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: typeof h.text === 'string' ? h.text : JSON.stringify(h.text) }],
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }],
  });

  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro'
  ];

  let lastError = null;
  let result = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;
        lastError = new Error(msg);
        if (response.status === 503 || response.status === 429 || msg.includes('high demand')) {
          continue;
        }
        throw lastError;
      }

      result = await response.json();
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        break;
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  if (!result) {
    throw lastError || new Error('Gagal menghubungi Gemini AI.');
  }

  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Tidak ada respons teks yang diterima dari Gemini AI.');
  }

  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    return {
      reply: stripMarkdownSymbols(parsed.reply) || 'Tugas telah disiapkan.',
      action: parsed.action || (parsed.todos?.length > 0 ? 'create_todos' : 'chat'),
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
    };
  } catch (parseErr) {
    console.error('Gagal mem-parse JSON dari Gemini:', rawText, parseErr);
    return {
      reply: stripMarkdownSymbols(rawText) || 'Perintah berhasil diproses.',
      action: 'chat',
      todos: [],
    };
  }
}

/**
 * Fungsi utama sendAiCommand:
 * Otomatis menggunakan Ollama jika provider = 'ollama' atau jika API key Gemini belum diisi.
 */
export async function sendAiCommand(userPrompt, currentTodos = [], chatHistory = []) {
  const provider = getAiProvider();

  // Jika eksplisit memilih Ollama
  if (provider === 'ollama') {
    return await sendOllamaCommand(userPrompt, currentTodos, chatHistory);
  }

  // Jika memilih Gemini
  const geminiKey = getGeminiApiKey();
  if (!geminiKey) {
    // Fallback cerdas: jika Gemini key kosong, langsung gunakan Ollama lokal agar pengguna tidak error!
    try {
      return await sendOllamaCommand(userPrompt, currentTodos, chatHistory);
    } catch (ollamaErr) {
      throw new Error(
        'Google Gemini API Key belum dikonfigurasi dan Ollama lokal tidak aktif. Silakan jalankan Ollama di laptop Anda.'
      );
    }
  }

  return await sendGeminiCommand(userPrompt, currentTodos, chatHistory);
}
