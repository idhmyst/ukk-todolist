/**
 * aiService.js
 * Layanan integrasi Google Gemini AI (gemini-2.5-flash) untuk Kelarin.
 * Memproses perintah bahasa alami menjadi tugas to-do terstruktur (Title, Priority, Due Date, Reminder)
 * dan memberikan asisten tanya jawab seputar jadwal tugas pengguna.
 */

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
 * Membersihkan simbol markdown yang mengganggu (seperti **, *, _, #, dll)
 * agar teks balasan selalu bersih, rapi, dan nyaman dibaca.
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
 * Kirim pesan ke Google Gemini 2.5 Flash untuk memproses perintah to-do atau percakapan
 * @param {string} userPrompt - Perintah atau pertanyaan dari pengguna
 * @param {Array} currentTodos - Daftar to-do saat ini untuk konteks asisten
 * @param {Array} chatHistory - Riwayat percakapan sebelumnya [{ role: 'user'|'model', text: '...' }]
 */
export async function sendAiCommand(userPrompt, currentTodos = [], chatHistory = []) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API Key belum dikonfigurasi.');
  }

  const dt = getCurrentDateTimeContext();

  // Ringkasan daftar tugas aktif untuk konteks Gemini
  const activeTodosSummary = currentTodos
    .slice(0, 15)
    .map((t) => {
      const status = t.is_completed ? 'Selesai' : 'Belum Selesai';
      const due = t.due_date ? `Tenggat: ${t.due_date}` : 'Tanpa tenggat';
      return `- [ID:${t.id}] ${t.title} (Prioritas: ${t.priority}, ${status}, ${due}, Reminder: ${t.reminder || 'none'})`;
    })
    .join('\n');

  const systemInstruction = `Kamu adalah "Kelarin AI", asisten pintar, ramah, dan proaktif di dalam aplikasi To-Do List modern "Kelarin".

KONTEKS WAKTU SISTEM SAAT INI:
- Waktu Lokal: ${dt.readable}
- Format Tanggal Hari Ini (ISO): ${dt.isoDate}
- Format Tanggal & Jam Sekarang (ISO): ${dt.isoDateTime}

DAFTAR TUGAS PENGGUNA SAAT INI:
${activeTodosSummary || '(Belum ada tugas)'}

TUGAS UTAMAMU:
1. Membantu pengguna menambahkan tugas baru melalui perintah bahasa alami (natural language).
   - Pengguna bisa meminta dalam bahasa Indonesia santai atau formal, misalnya:
     * "Besok jam 9 pagi tolong ingatkan bikin laporan fisika, prioritas tinggi, notif 30 menit"
     * "Tambahkan tugas cuci motor nanti sore jam 4"
     * "Buatkan jadwal belajar ujian untuk 3 hari ke depan"
2. Membantu menjawab pertanyaan tentang tugas pengguna (misal: "Apa tugas yang paling mendesak?", "Ada jadwal apa hari ini?").

ATURAN EKSTRAKSI TUGAS (action: "create_todos"):
- Jika pengguna meminta menambahkan satu atau beberapa tugas, ekstrak ke dalam array "todos".
- Tiap item dalam "todos" HARUS memiliki properti:
  * "title": String nama tugas ringkas, jelas, huruf kapital di awal.
  * "priority": Salah satu dari "high" | "medium" | "low". Default ke "medium" jika tidak disebut secara spesifik.
  * "due_date": String ISO format "YYYY-MM-DDTHH:mm".
    - Jika pengguna menyebut "besok jam 9 pagi", hitung tanggal besok dari tanggal sistem ${dt.isoDate} dan format "YYYY-MM-DDT09:00".
    - Jika pengguna menyebut "lusa", tambahkan 2 hari.
    - Jika pengguna menyebut "nanti sore jam 17:00", gunakan tanggal hari ini ${dt.isoDate} dan jam 17:00.
    - Jika pengguna menyebut "hari senin depan jam 10", hitung tanggal hari senin mendatang.
    - Jika pengguna tidak menyebut jam, default ke jam "23:59" atau jam kerja sesuai konteks.
    - Nilai TIDAK BOLEH berada di masa lalu (sebelum ${dt.isoDateTime}).
  * "reminder": Salah satu dari "1h" | "30m" | "5m" | "none". Default ke "30m" jika ada due_date, atau "none" jika tidak ditentukan.

FORMAT OUTPUT WAJIB (JSON murni tanpa tanda petik kode):
{
  "reply": "Pesan balasan sangat singkat (cukup 1 kalimat pendek, to the point, dilarang menggunakan markdown seperti **bold**, *italic*, ### heading, bullet, atau kata-kata alay)",
  "action": "create_todos" atau "chat",
  "todos": [
    {
      "title": "Judul Tugas",
      "priority": "high" | "medium" | "low",
      "due_date": "YYYY-MM-DDTHH:mm",
      "reminder": "1h" | "30m" | "5m" | "none"
    }
  ]
}

ATURAN BALASAN ("reply"):
- Balas dengan SANGAT SINGKAT, PADAT, dan LANGSUNG PADA INTI (cukup 1 kalimat pendek, maksimal 2 kalimat).
- DILARANG menggunakan karakter format seperti asterik ganda (**), garis bawah (_), pagar (#), atau tanda kutip yang tidak perlu.
- JANGAN bertele-tele dan JANGAN menggunakan gaya bahasa alay.
- Contoh balasan yang baik:
  * "Tugas sudah saya siapkan, silakan klik Tambah."
  * "Ada 2 tugas aktif hari ini, yang paling mendesak adalah [Judul]."
  * "Halo! Mau catat tugas apa hari ini?"

Jika pengguna hanya mengobrol, menyapa, atau bertanya tanpa ada instruksi membuat tugas, isi "action": "chat" dan "todos": [].`;

  // Format riwayat chat untuk Gemini API
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

  // Tambahkan riwayat percakapan sebelumnya jika ada
  chatHistory.slice(-6).forEach((h) => {
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: typeof h.text === 'string' ? h.text : JSON.stringify(h.text) }],
    });
  });

  // Tambahkan pesan pengguna terakhir
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
        // Jika high demand, coba model berikutnya
        if (response.status === 503 || response.status === 429 || msg.includes('high demand')) {
          continue;
        }
        throw lastError;
      }

      result = await response.json();
      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        break; // Berhasil!
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

  // Parse JSON aman
  try {
    const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);
    return {
      reply: stripMarkdownSymbols(parsed.reply) || 'Tugas telah disiapkan.',
      action: parsed.action || (parsed.todos?.length > 0 ? 'create_todos' : 'chat'),
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
    };
  } catch (parseErr) {
    console.error('Gagal mem-parse respons JSON dari Gemini:', rawText, parseErr);
    return {
      reply: stripMarkdownSymbols(rawText) || 'Perintah berhasil diproses.',
      action: 'chat',
      todos: [],
    };
  }
}
