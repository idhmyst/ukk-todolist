import { getDb, setCorsHeaders, formatTodo } from '../_db.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const rows = await sql.query('SELECT * FROM todos ORDER BY id DESC');
      return res.status(200).json({
        data: rows.map(formatTodo),
      });
    }

    if (req.method === 'POST') {
      const { title, priority, due_date, reminder } = req.body || {};

      const trimmedTitle = (title || '').trim();
      if (!trimmedTitle) {
        return res.status(400).json({
          error: "Field 'title' wajib diisi",
        });
      }

      let p = (priority || 'medium').trim().toLowerCase();
      if (p !== 'low' && p !== 'medium' && p !== 'high') {
        p = 'medium';
      }

      let r = (reminder || '30m').trim().toLowerCase();
      if (!r) {
        r = '30m';
      }

      const dueDate = (due_date || '').trim();
      if (!dueDate) {
        return res.status(400).json({
          error: 'Tenggat waktu (tanggal dan jam) wajib ditentukan terlebih dahulu',
        });
      }

      // Validasi deadline tidak di masa lalu
      let targetTime;
      if (dueDate.includes('T')) {
        targetTime = new Date(dueDate);
      } else {
        targetTime = new Date(`${dueDate}T23:59:59`);
      }

      if (!isNaN(targetTime.getTime())) {
        if (targetTime.getTime() < Date.now() - 60000) {
          return res.status(400).json({
            error: 'Tenggat waktu (deadline) tidak boleh tanggal yang sudah lewat atau hari kemarin',
          });
        }
      }

      const result = await sql.query(
        `INSERT INTO todos (title, priority, is_completed, due_date, reminder, created_at, updated_at)
         VALUES ($1, $2, false, $3, $4, NOW(), NOW())
         RETURNING *`,
        [trimmedTitle, p, dueDate, r]
      );

      return res.status(201).json({
        data: formatTodo(result[0]),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error in /api/todos:', error);
    return res.status(500).json({
      error: 'Terjadi kesalahan pada server database: ' + (error.message || String(error)),
    });
  }
}
