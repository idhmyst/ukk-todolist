import { getDb, setCorsHeaders, formatTodo } from '../_db.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { id } = req.query || {};
  if (!id) {
    return res.status(400).json({ error: 'Parameter ID diperlukan' });
  }

  const sql = getDb();

  try {
    // Penanganan khusus jika rute /api/todos/completed jatuh ke dynamic route
    if (id === 'completed' && req.method === 'DELETE') {
      const result = await sql.query('DELETE FROM todos WHERE is_completed = true');
      return res.status(200).json({
        message: 'Semua tugas yang telah selesai berhasil dibersihkan',
        deleted: result.length,
      });
    }

    if (req.method === 'GET') {
      const rows = await sql.query('SELECT * FROM todos WHERE id = $1', [id]);
      if (!rows.length) {
        return res.status(404).json({ error: `To-do dengan ID ${id} tidak ditemukan` });
      }
      return res.status(200).json({ data: formatTodo(rows[0]) });
    }

    if (req.method === 'PUT') {
      const rows = await sql.query('SELECT * FROM todos WHERE id = $1', [id]);
      if (!rows.length) {
        return res.status(404).json({ error: `To-do dengan ID ${id} tidak ditemukan` });
      }

      const existing = rows[0];
      const { title, priority, is_completed, due_date, reminder } = req.body || {};

      let newTitle = existing.title;
      if (typeof title === 'string') {
        const t = title.trim();
        if (t) newTitle = t;
      }

      let newPriority = existing.priority;
      if (typeof priority === 'string') {
        const p = priority.trim().toLowerCase();
        if (p === 'low' || p === 'medium' || p === 'high') {
          newPriority = p;
        }
      }

      let newDueDate = existing.due_date;
      if (typeof due_date === 'string') {
        const d = due_date.trim();
        if (title !== undefined && !d) {
          return res.status(400).json({
            error: 'Tenggat waktu (tanggal dan jam) wajib ditentukan terlebih dahulu',
          });
        }
        if (d && d !== existing.due_date) {
          let targetTime;
          if (d.includes('T')) {
            targetTime = new Date(d);
          } else {
            targetTime = new Date(`${d}T23:59:59`);
          }
          if (!isNaN(targetTime.getTime()) && targetTime.getTime() < Date.now() - 60000) {
            return res.status(400).json({
              error: 'Tenggat waktu (deadline) tidak boleh tanggal yang sudah lewat atau hari kemarin',
            });
          }
        }
        newDueDate = d;
      }

      let newCompleted = existing.is_completed;
      if (typeof is_completed === 'boolean') {
        newCompleted = is_completed;
      }

      let newReminder = existing.reminder;
      if (typeof reminder === 'string') {
        newReminder = reminder.trim().toLowerCase() || '30m';
      }

      const updated = await sql.query(
        `UPDATE todos
         SET title = $1, priority = $2, is_completed = $3, due_date = $4, reminder = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [newTitle, newPriority, newCompleted, newDueDate, newReminder, id]
      );

      return res.status(200).json({
        data: formatTodo(updated[0]),
      });
    }

    if (req.method === 'DELETE') {
      const rows = await sql.query('SELECT id FROM todos WHERE id = $1', [id]);
      if (!rows.length) {
        return res.status(404).json({ error: `To-do dengan ID ${id} tidak ditemukan` });
      }

      await sql.query('DELETE FROM todos WHERE id = $1', [id]);
      return res.status(200).json({
        message: 'To-do berhasil dihapus',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`API Error in /api/todos/${id}:`, error);
    return res.status(500).json({
      error: 'Terjadi kesalahan pada server database: ' + (error.message || String(error)),
    });
  }
}
