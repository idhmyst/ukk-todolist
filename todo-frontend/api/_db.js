import { neon } from '@neondatabase/serverless';

let sqlClient = null;

export function getDb() {
  if (!sqlClient) {
    const rawUrl =
      process.env.DATABASE_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL;

    if (!rawUrl) {
      throw new Error('DATABASE_URL is not configured in environment variables');
    }

    const connectionString = rawUrl.replace(/&?channel_binding=[^&]*/g, '');
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function formatTodo(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    title: row.title,
    priority: row.priority || 'medium',
    is_completed: Boolean(row.is_completed),
    due_date: row.due_date || '',
    reminder: row.reminder || '30m',
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}
