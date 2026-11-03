import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import TodoForm from './components/TodoForm';
import FilterBar from './components/FilterBar';
import TodoItem from './components/TodoItem';
import EditModal from './components/EditModal';
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

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [toast, setToast] = useState(null);

  // Helper Toast Feedback
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
      setErrorMessage(err.message || 'Gagal terhubung ke REST API Golang.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodosData(true);
  }, [fetchTodosData]);

  // Handler: Tambah Todo (POST /api/todos)
  const handleAddTodo = async (title, priority, dueDate) => {
    setIsSubmitting(true);
    try {
      const newTodo = await createTodo(title, priority, dueDate);
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

  // Handler: Toggle Status Selesai (PUT /api/todos/:id)
  const handleToggleStatus = async (id, nextStatus) => {
    const previousTodos = [...todos];
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: nextStatus } : t))
    );

    try {
      const updated = await updateTodo(id, { is_completed: nextStatus });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast(
        nextStatus ? 'Tugas ditandai selesai!' : 'Tugas dikembalikan ke pending',
        'success'
      );
    } catch (err) {
      // Rollback jika request gagal
      setTodos(previousTodos);
      showToast(err.message || 'Gagal mengubah status tugas', 'error');
    }
  };

  // Handler: Edit Todo (PUT /api/todos/:id)
  const handleUpdateTodo = async (id, payload) => {
    setIsSubmitting(true);
    try {
      const updated = await updateTodo(id, payload);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast('Tugas berhasil diperbarui!', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui tugas', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Hapus Todo (DELETE /api/todos/:id)
  const handleDeleteTodo = async (id) => {
    const previousTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTodo(id);
      showToast('Tugas berhasil dihapus', 'success');
    } catch (err) {
      setTodos(previousTodos);
      showToast(err.message || 'Gagal menghapus tugas', 'error');
    }
  };

  // Counter tasks
  const counts = useMemo(() => {
    const all = todos.length;
    const completed = todos.filter((t) => t.is_completed).length;
    const pending = all - completed;
    return { all, pending, completed };
  }, [todos]);

  // Filtered & Searched todos
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    // Filter tab
    if (activeFilter === 'pending') {
      result = result.filter((t) => !t.is_completed);
    } else if (activeFilter === 'completed') {
      result = result.filter((t) => t.is_completed);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.priority && t.priority.toLowerCase().includes(q))
      );
    }

    return result;
  }, [todos, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-gray-100 to-indigo-50/30">
      <div className="max-w-2xl mx-auto">
        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 animate-bounce transition-all">
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold backdrop-blur-md ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
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

        {/* Main Card Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-5 sm:p-8 transition-all">
          {/* Header & Navbar */}
          <Navbar
            isBackendOnline={isBackendOnline}
            isRefreshing={isLoading}
            onRefresh={() => fetchTodosData(false)}
          />

          {/* Form Tambah Tugas */}
          <TodoForm onAddTodo={handleAddTodo} isSubmitting={isSubmitting} />

          {/* Alert Error saat backend offline */}
          {errorMessage && (
            <ErrorAlert
              message={errorMessage}
              onRetry={() => fetchTodosData(true)}
              isRetrying={isLoading}
            />
          )}

          {/* Filter Bar & Search */}
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={counts}
          />

          {/* List Item Tugas */}
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
                  onEdit={(target) => setEditingTodo(target)}
                  onDelete={handleDeleteTodo}
                />
              ))
            )}
          </div>

          {/* Footer Card */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Uji Kompetensi Keahlian (UKK) • PPLG SMK</span>
            <span>React (Vite) + Tailwind CSS + Golang Gin</span>
          </div>
        </div>
      </div>

      {/* Edit Modal Popup */}
      <EditModal
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
        onUpdateTodo={handleUpdateTodo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
