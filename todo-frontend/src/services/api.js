/**
 * REST API Client untuk Kelarin (To-Do List)
 * Dilengkapi dengan Smart Multi-Tier Failover:
 * 1. Menghubungi Go Backend lokal jika berjalan (http://localhost:8080/api)
 * 2. Menghubungi Vite Dev Proxy (/api)
 * 3. Otomatis failover ke Live Cloud Serverless + Neon PostgreSQL (https://kelarin-eight.vercel.app/api)
 *
 * Dengan arsitektur failover ini, aplikasi otomatis berjalan lancar dimanapun
 * tanpa mengharuskan pengguna menyalakan backend secara manual.
 */ 

const CLOUD_API_URL = 'https://kelarin-eight.vercel.app/api';

// Deteksi apakah sedang berjalan di environment lokal (localhost / WiFi LAN IP)
function isLocalEnvironment() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname || '';
  const port = window.location.port || '';
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.') ||
    host.endsWith('.local') ||
    port === '5173' ||
    port === '5174' ||
    port === '3000'
  );
}

// Menentukan daftar kandidat base URL sesuai urutan prioritas
function getCandidateBaseUrls() {
  const isLocal = isLocalEnvironment();

  // Cek custom VITE_API_URL jika ditentukan
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  const validEnvUrl =
    envUrl &&
    !envUrl.includes('onrender.com') &&
    !envUrl.includes('nama-backend') &&
    !envUrl.includes('example.com')
      ? envUrl.replace(/\/$/, '')
      : null;

  if (isLocal) {
    const list = [];
    if (validEnvUrl) list.push(validEnvUrl);
    list.push('http://localhost:8080/api');
    list.push('/api');
    list.push(CLOUD_API_URL);
    return Array.from(new Set(list));
  }

  // Cloud (Vercel)
  const list = ['/api'];
  if (typeof window !== 'undefined' && window.location.origin) {
    list.push(`${window.location.origin}/api`);
  }
  list.push(CLOUD_API_URL);
  return Array.from(new Set(list));
}

// Menyimpan base URL yang sedang aktif & terbukti berhasil
let activeBaseUrl = null;

/**
 * Melakukan HTTP request dengan automatic multi-candidate failover
 */
async function requestWithFailover(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const candidates = getCandidateBaseUrls();
  const orderedCandidates = activeBaseUrl
    ? [activeBaseUrl, ...candidates.filter((c) => c !== activeBaseUrl)]
    : candidates;

  let lastError = null;

  for (let i = 0; i < orderedCandidates.length; i++) {
    const candidate = orderedCandidates[i];
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${candidate.replace(/\/$/, '')}${cleanPath}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Cek apakah response berupa JSON
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      // Jika response bukan JSON (misal HTML atau JS dari dev server yang salah rute), coba kandidat berikutnya
      if (!isJson && response.status < 400) {
        lastError = new Error('Respons server bukan JSON valid.');
        continue;
      }

      const data = isJson ? await response.json().catch(() => null) : null;

      if (!response.ok) {
        // Jika error validasi client (400, 404, 422), jangan failover karena error berasal dari payload
        if (response.status >= 400 && response.status < 500) {
          activeBaseUrl = candidate;
          const msg = data?.error || data?.message || `Request gagal (${response.status})`;
          throw new Error(msg);
        }

        // Server error (500, 502, 503, 504): coba kandidat berikutnya
        lastError = new Error(data?.error || data?.message || `Server error (${response.status})`);
        continue;
      }

      // Berhasil! Simpan kandidat ini untuk request berikutnya
      activeBaseUrl = candidate;
      return data;
    } catch (err) {
      clearTimeout(timeoutId);

      // Jika error validasi client (misal: "Field 'title' wajib diisi"), langsung lemparkan
      if (err.message && !err.message.includes('failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('aborted') && !err.message.includes('Server error')) {
        // Error bisnis dari server
        if (err.message.startsWith('Field') || err.message.startsWith('Tenggat')) {
          throw err;
        }
      }

      lastError = err;
      // Lanjut ke kandidat endpoint berikutnya
    }
  }

  // Jika semua kandidat gagal:
  const isCloud = !isLocalEnvironment();
  if (isCloud) {
    throw new Error(
      'Koneksi ke database cloud sedang memuat ulang. Silakan klik "Coba Lagi".'
    );
  }

  throw new Error(
    lastError?.message ||
      'Tidak dapat terhubung ke server backend. Pastikan server atau koneksi internet Anda aktif.'
  );
}

/**
 * Mengambil seluruh daftar to-do
 * GET /todos
 * Response: { "data": [ ... ] }
 */
export const getTodos = async () => {
  const result = await requestWithFailover('/todos', { method: 'GET' });
  return result?.data || [];
};

/**
 * Membuat to-do baru
 * POST /todos
 * Menerima baik parameter terpisah (title, priority, dueDate, reminder)
 * maupun satu objek { title, priority, due_date, reminder }
 */
export const createTodo = async (titleOrObj, priority = 'medium', dueDate = '', reminder = '30m') => {
  let title = '';
  let finalPriority = priority;
  let finalDueDate = dueDate;
  let finalReminder = reminder;

  if (titleOrObj && typeof titleOrObj === 'object') {
    title = titleOrObj.title || '';
    finalPriority = titleOrObj.priority || priority || 'medium';
    finalDueDate = titleOrObj.due_date || titleOrObj.dueDate || dueDate || '';
    finalReminder = titleOrObj.reminder || reminder || '30m';
  } else {
    title = titleOrObj || '';
  }

  const result = await requestWithFailover('/todos', {
    method: 'POST',
    body: {
      title: String(title || '').trim(),
      priority: String(finalPriority || 'medium').trim(),
      due_date: String(finalDueDate || '').trim(),
      reminder: String(finalReminder || '30m').trim(),
    },
  });
  return result?.data;
};

/**
 * Mengupdate status to-do atau data tugas (title, priority, due_date, is_completed)
 * PUT /todos/:id
 * Payload: { is_completed?: boolean, title?: string, priority?: string, due_date?: string }
 */
export const updateTodo = async (id, payload) => {
  const result = await requestWithFailover(`/todos/${id}`, {
    method: 'PUT',
    body: payload,
  });
  return result?.data;
};

/**
 * Menghapus to-do berdasarkan ID
 * DELETE /todos/:id
 */
export const deleteTodo = async (id) => {
  return await requestWithFailover(`/todos/${id}`, { method: 'DELETE' });
};

/**
 * Membersihkan seluruh tugas yang sudah selesai
 * DELETE /todos/completed (dengan fallback parallel delete)
 */
export const clearCompletedTodos = async (completedIds = []) => {
  try {
    return await requestWithFailover('/todos/completed', { method: 'DELETE' });
  } catch (error) {
    if (completedIds.length > 0) {
      await Promise.all(completedIds.map((id) => deleteTodo(id)));
      return { message: 'Semua tugas selesai berhasil dibersihkan' };
    }
    throw error;
  }
};

export default {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  clearCompletedTodos,
};
