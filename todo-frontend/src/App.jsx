import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import TodoForm from './components/TodoForm';
import FilterBar from './components/FilterBar';
import TodoItem from './components/TodoItem';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import ErrorAlert from './components/ErrorAlert';
import { getTodos, createTodo, updateTodo, deleteTodo } from './services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // Tampilkan notifikasi toast sesaat
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Fetch todos dari Golang REST API
  const fetchTodosData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getTodos();
      setTodos(data);
      setIsBackendOnline(true);
    } catch (err) {
      setIsBackendOnline(false);
      setErrorMessage(err.message || 'Gagal memuat daftar to-do.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Muat data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchTodosData(true);
  }, [fetchTodosData]);

  // Handler: Tambah Todo baru (POST /api/todos)
  const handleAddTodo = async (title, priority) => {
    setIsSubmitting(true);
    try {
      const newTodo = await createTodo(title, priority);
      // Letakkan to-do terbaru di urutan teratas
      setTodos((prev) => [newTodo, ...prev]);
      showToast('Tugas baru berhasil ditambahkan!', 'success');
      setIsBackendOnline(true);
      return true;
    } catch (err) {
      showToast(err.message || 'Gagal menambahkan tugas', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Toggle status is_completed (PUT /api/todos/:id)
  const handleToggleStatus = async (id, nextStatus) => {
    // Optimistic UI update untuk interaksi instan
    const previousTodos = [...todos];
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: nextStatus } : t))
    );

    try {
      const updated = await updateTodo(id, { is_completed: nextStatus });
      // Sinkronisasi dengan data respon backend
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast(
        nextStatus ? 'Tugas ditandai selesai!' : 'Tugas dikembalikan ke pending',
        'success'
      );
    } catch (err) {
      // Rollback jika request ke server gagal
      setTodos(previousTodos);
      showToast(err.message || 'Gagal mengubah status tugas', 'error');
    }
  };

  // Handler: Hapus Todo (DELETE /api/todos/:id)
  const handleDeleteTodo = async (id) => {
    const previousTodos = [...todos];
    // Optimistic remove
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTodo(id);
      showToast('Tugas berhasil dihapus', 'success');
    } catch (err) {
      // Rollback jika gagal
      setTodos(previousTodos);
      showToast(err.message || 'Gagal menghapus tugas', 'error');
      throw err;
    }
  };

  // Hitung jumlah tugas untuk masing-masing tab status
  const counts = useMemo(() => {
    const all = todos.length;
    const completed = todos.filter((t) => t.is_completed).length;
    const pending = all - completed;
    return { all, pending, completed };
  }, [todos]);

  // Filter daftar tugas sesuai tab yang aktif
  const filteredTodos = useMemo(() => {
    if (activeFilter === 'pending') {
      return todos.filter((t) => !t.is_completed);
    }
    if (activeFilter === 'completed') {
      return todos.filter((t) => t.is_completed);
    }
    return todos;
  }, [todos, activeFilter]);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Toast Notification Floating */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 animate-bounce transition-all">
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold backdrop-blur-md ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/10'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Card Container Utama */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/70 p-5 sm:p-8">
          {/* Header & Navbar */}
          <Navbar
            isBackendOnline={isBackendOnline}
            isRefreshing={isLoading}
            onRefresh={() => fetchTodosData(false)}
          />

          {/* Form Input Todo */}
          <TodoForm onAddTodo={handleAddTodo} isSubmitting={isSubmitting} />

          {/* Alert Error jika Backend Go belum berjalan */}
          {errorMessage && (
            <ErrorAlert
              message={errorMessage}
              onRetry={() => fetchTodosData(true)}
              isRetrying={isLoading}
            />
          )}

          {/* Filter & Counter Bar */}
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />

          {/* List Content: Skeleton / Empty State / Todo Items */}
          <div className="space-y-3">
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredTodos.length === 0 ? (
              <EmptyState filter={activeFilter} />
            ) : (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDeleteTodo}
                />
              ))
            )}
          </div>

          {/* Footer Card */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Uji Kompetensi Keahlian (UKK) • PPLG SMK</span>
            <span>React + Vite + Tailwind CSS + Golang Gin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

