import { neon } from '@neondatabase/serverless';

let sqlClient = null;

const FALLBACK_DB_URL =
  'postgresql://neondb_owner:npg_TOnrFfKH4cu9@ep-mute-lab-bdw7rg1o-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require';

export function getDb() {
  if (!sqlClient) {
    const rawUrl =
      process.env.DATABASE_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.POSTGRES_URL ||
      FALLBACK_DB_URL;

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
