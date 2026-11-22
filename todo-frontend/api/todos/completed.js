import { getDb, setCorsHeaders } from '../_db.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sql = getDb();

  try {
    const result = await sql.query('DELETE FROM todos WHERE is_completed = true RETURNING id');
    return res.status(200).json({
      message: 'Semua tugas yang telah selesai berhasil dibersihkan',
      deleted: result.length,
    });
  } catch (error) {
    console.error('API Error in /api/todos/completed:', error);
    return res.status(500).json({
      error: 'Gagal membersihkan tugas selesai: ' + (error.message || String(error)),
    });
  }
}
