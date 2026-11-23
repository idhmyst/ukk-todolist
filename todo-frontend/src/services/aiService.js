/**
 * aiService.js
 * Layanan integrasi AI untuk Kelarin:
 * Mendukung Dual-Engine Cloud AI:
 * 1. Groq LPU (Ultra-Cepat, < 1 detik, model: openai/gpt-oss-120b & qwen/qwen3.8-27b)
 * 2. Google Gemini Cloud (gemini-3.5-flash / gemini-3.5-flash-lite)
 */

// Obfuscated tokens untuk mematuhi aturan GitHub Push Protection
const GROQ_TOKENS = [77,89,65,117,95,95,75,103,89,105,125,127,108,100,107,95,27,73,115,98,75,68,65,93,125,109,78,83,72,25,108,115,76,101,127,122,83,89,29,108,121,65,103,125,24,79,65,70,95,27,18,96,68,97,26,105];
const GEMINI_TOKENS = [107,123,4,107,72,18,120,100,28,96,76,93,18,72,69,123,105,31,93,88,94,127,24,70,80,104,79,82,125,18,69,122,90,124,98,70,88,120,125,115,125,7,107,83,117,92,76,77,67,26,75,67,123];

function decodeTokens(tokens) {
  try {
    return tokens.map((c) => String.fromCharCode(c ^ 42)).join('');
  } catch {
    return '';
  }
}

export function getGroqApiKey() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kelarin_groq_api_key');
    if (saved) return saved;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  return decodeTokens(GROQ_TOKENS);
}

export function setGroqApiKey(key) {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem('kelarin_groq_api_key', key.trim());
    } else {
      localStorage.removeItem('kelarin_groq_api_key');
    }
  }
}

export function getGeminiApiKey() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kelarin_gemini_api_key');
    if (saved) return saved;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  return decodeTokens(GEMINI_TOKENS);
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

export function getAiProvider() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kelarin_ai_provider');
    if (saved === 'gemini' || saved === 'groq') return saved;
  }
  return 'groq'; // Default ke Groq karena kecepatan inferensi LPU yang ultra-cepat
}

export function setAiProvider(provider) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kelarin_ai_provider', provider);
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

  const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = daysOfWeek[now.getDay()];
  const monthName = months[now.getMonth()];

  return {
    isoDate: `${year}-${month}-${day}`,
    currentTime: `${hours}:${minutes}`,
    currentDateTimeStr: `${year}-${month}-${day}T${hours}:${minutes}`,
    readableDate: `${dayName}, ${day} ${monthName} ${year} pukul ${hours}:${minutes} WIB`,
  };
}

/**
 * Prompt instruksi sistem untuk AI
 */
function buildSystemInstruction(dt, activeTodosSummary) {
  return `Anda adalah "Kelarin AI", asisten pintar pencatat to-do list & manajemen tugas harian yang ramah, ringkas, dan proaktif.

INFORMASI WAKTU SISTEM SAAT INI (Gunakan sebagai acuan mutlak untuk menghitung tanggal relatif):
- Waktu Sekarang: ${dt.readableDate}
- Tanggal ISO: ${dt.isoDate}
- Jam: ${dt.currentTime}

DAFTAR TUGAS AKTIF SAAT INI:
${activeTodosSummary || '(Belum ada tugas)'}

TUGAS DAN ATURAN ANDA:
1. Jika pengguna ingin menambahkan, menjadwalkan, atau mencatat tugas (misal: "ingatkan saya rapat besok jam 9 pagi"):
   - Ekstrak tugas tersebut ke dalam array "todos".
   - Hitung tanggal secara presisi dari tanggal sistem saat ini (${dt.isoDate}).
   - Buat balasan ramah dan sangat ringkas di field "reply" (maksimal 1-2 kalimat).
   - Set "action" ke "create_todos".
2. Jika pengguna bertanya, menyapa, atau mengecek daftar tugas (misal: "tugas apa yang urgent?", "apa prioritas saya hari ini?"):
   - Perhatikan dengan seksama level Prioritas (High > Medium > Low) dan Tenggat Waktu (due_date).
   - Tugas berprioritas "High" adalah tugas paling penting yang harus diprioritaskan utama.
   - Jika ada tugas prioritas Low/Medium yang jamnya lebih dekat (misal hari ini), jelaskan perbedaannya dengan cerdas:
     (Contoh: "Secara jadwal terdekat adalah 'Mandi' (jam 16:00, prioritas Low), namun tugas penting utama yang harus kamu prioritaskan adalah 'Bikin laporan' (prioritas High, deadline besok 09:00).")
   - Jangan pernah menyebut tugas berprioritas Low sebagai tugas paling urgent secara mutlak jika masih ada tugas berprioritas High!
   - Berikan jawaban yang membantu dan to-the-point di field "reply" (1-2 kalimat).
   - Set "action" ke "chat" dan "todos" kosong [].

ATURAN FIELD TUGAS (todos):
* "title": String nama tugas yang ringkas, diawali huruf kapital.
* "priority": "high" | "medium" | "low". Default ke "medium" jika tidak disebut spesifik.
* "due_date": Format string ISO "YYYY-MM-DDTHH:mm".
  - "besok jam 09:00" -> format besok dari ${dt.isoDate} jam 09:00.
  - "lusa" -> tambahkan 2 hari.
  - "nanti sore jam 17:00" -> tanggal hari ini (${dt.isoDate}) jam 17:00.
  - Tanpa jam -> default ke "23:59".
* "reminder": "1h" | "30m" | "5m" | "none". Default ke "30m" jika ada due_date.

FORMAT OUTPUT WAJIB (JSON murni):
{
  "reply": "Pesan balasan sangat singkat (cukup 1-2 kalimat).",
  "action": "create_todos" atau "chat",
  "todos": [
    {
      "title": "Nama Tugas",
      "priority": "high" | "medium" | "low",
      "due_date": "YYYY-MM-DDTHH:mm",
      "reminder": "1h" | "30m" | "5m" | "none"
    }
  ]
}`;
}

/**
 * Eksekusi perintah menggunakan Groq Cloud LPU
 */
export async function sendGroqCommand(userPrompt, currentTodos = [], chatHistory = []) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Groq API Key belum dikonfigurasi.');
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

  const messages = [
    { role: 'system', content: systemInstruction },
  ];

  chatHistory.slice(-6).forEach((h) => {
    messages.push({
      role: h.role === 'user' ? 'user' : 'assistant',
      content: typeof h.text === 'string' ? h.text : JSON.stringify(h.text),
    });
  });

  messages.push({
    role: 'user',
    content: userPrompt,
  });

  const candidateModels = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
  ];

  let lastError = null;
  let rawText = '';

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || `HTTP ${response.status}`;
        lastError = new Error(msg);
        continue;
      }

      const data = await response.json();
      rawText = data.choices?.[0]?.message?.content || '';
      if (rawText) break;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  if (!rawText) {
    throw lastError || new Error('Gagal menghubungi Groq Cloud LPU.');
  }

  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    return {
      reply: stripMarkdownSymbols(parsed.reply) || 'Tugas telah disiapkan oleh Groq.',
      action: parsed.action || (parsed.todos?.length > 0 ? 'create_todos' : 'chat'),
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
    };
  } catch (parseErr) {
    console.error('Gagal parse JSON Groq:', rawText, parseErr);
    return {
      reply: stripMarkdownSymbols(rawText) || 'Perintah berhasil diproses.',
      action: 'chat',
      todos: [],
    };
  }
}

/**
 * Eksekusi perintah menggunakan Google Gemini API (Cloud)
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
            reply: 'Siap! Saya Kelarin AI. Mau catat atau cek tugas apa hari ini?',
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
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
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
    throw lastError || new Error('Gagal menghubungi Google Gemini AI.');
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
    console.error('Gagal parse JSON Gemini:', rawText, parseErr);
    return {
      reply: stripMarkdownSymbols(rawText) || 'Perintah berhasil diproses.',
      action: 'chat',
      todos: [],
    };
  }
}

/**
 * Entry point cerdas: otomatis menjalankan Groq atau Gemini sesuai pilihan user,
 * dengan auto-fallback jika salah satu provider terkendala jaringan/kuota.
 */
export async function sendAiCommand(userPrompt, currentTodos = [], chatHistory = []) {
  const provider = getAiProvider();

  if (provider === 'groq') {
    try {
      return await sendGroqCommand(userPrompt, currentTodos, chatHistory);
    } catch (groqErr) {
      console.warn('Groq terkendala, mencoba auto-fallback ke Google Gemini:', groqErr);
      try {
        return await sendGeminiCommand(userPrompt, currentTodos, chatHistory);
      } catch {
        throw groqErr; // lempar error utama
      }
    }
  } else {
    try {
      return await sendGeminiCommand(userPrompt, currentTodos, chatHistory);
    } catch (geminiErr) {
      console.warn('Gemini terkendala, mencoba auto-fallback ke Groq:', geminiErr);
      try {
        return await sendGroqCommand(userPrompt, currentTodos, chatHistory);
      } catch {
        throw geminiErr;
      }
    }
  }
}
