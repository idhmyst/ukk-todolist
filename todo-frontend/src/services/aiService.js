/**
 * aiService.js
 * Layanan integrasi AI untuk Kelarin:
 * Menggunakan Google Gemini Cloud AI (Cepat, Cerdas, dan Otomatis Aktif di Cloud).
 */

const ENCODED_DEFAULT_KEY = 'QVEuQWI4Uk42SmZ3OGJvUUM1d3J0VTJsekJleFc4b1BwVkhsclJXWVctQXlfdmZnaTBhaVE=';

export function getGeminiApiKey() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('kelarin_gemini_api_key');
    if (saved) return saved;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  try {
    return atob(ENCODED_DEFAULT_KEY);
  } catch {
    return '';
  }
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
 * Prompt instruksi sistem untuk Google Gemini
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
2. Jika pengguna hanya bertanya, menyapa, atau mengecek daftar tugas (misal: "apa tugas saya yang paling mendesak?"):
   - Berikan jawaban yang membantu dan to-the-point di field "reply".
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
 * Entry point tunggal untuk mengeksekusi perintah AI
 */
export async function sendAiCommand(userPrompt, currentTodos = [], chatHistory = []) {
  return await sendGeminiCommand(userPrompt, currentTodos, chatHistory);
}
