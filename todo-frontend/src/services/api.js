import axios from 'axios';

// Base URL REST API Backend Golang Gin
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 8000, // 8 detik timeout
});

/**
 * Mengambil seluruh daftar to-do dari backend
 * GET http://localhost:8080/api/todos
 * Response: { "data": [ ... ] }
 */
export const getTodos = async () => {
  try {
    const response = await apiClient.get('/todos');
    // Backend mengembalikan { "data": [...] }
    return response.data?.data || [];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Membuat to-do baru
 * POST http://localhost:8080/api/todos
 * Payload: { "title": string, "priority": "low" | "medium" | "high" }
 */
export const createTodo = async (title, priority = 'medium') => {
  try {
    const response = await apiClient.post('/todos', {
      title: title.trim(),
      priority,
    });
    return response.data?.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Mengupdate status to-do (toggle is_completed atau update title/priority)
 * PUT http://localhost:8080/api/todos/:id
 * Payload: { is_completed?: boolean, title?: string, priority?: string }
 */
export const updateTodo = async (id, payload) => {
  try {
    const response = await apiClient.put(`/todos/${id}`, payload);
    return response.data?.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Menghapus to-do berdasarkan ID
 * DELETE http://localhost:8080/api/todos/:id
 */
export const deleteTodo = async (id) => {
  try {
    const response = await apiClient.delete(`/todos/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Penanganan dan standardisasi pesan error
 */
function handleApiError(error) {
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return new Error(
      'Tidak dapat terhubung ke server backend Golang (http://localhost:8080). Pastikan backend sudah dijalankan.'
    );
  }
  const backendMsg = error.response?.data?.error || error.response?.data?.message;
  if (backendMsg) {
    return new Error(backendMsg);
  }
  return new Error(error.message || 'Terjadi kesalahan pada komunikasi dengan server.');
}

export default apiClient;

