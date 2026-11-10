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
import { sortTodos } from './utils/todoHelpers';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Filters, Search & Smart Urgency Sorting
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'deadline' | 'priority' | 'newest'
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

  // Filtered, Searched & Smart-Sorted todos
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    if (activeFilter === 'pending') {
      result = result.filter((t) => !t.is_completed);
    } else if (activeFilter === 'completed') {
      result = result.filter((t) => t.is_completed);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.priority && t.priority.toLowerCase().includes(q))
      );
    }

    // Urutkan berdasarkan tingkat urgensi & deadline
    return sortTodos(result, sortBy);
  }, [todos, activeFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-100/70 p-2 sm:p-5 lg:p-8 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce transition-all max-w-[90vw]">
          <div
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold backdrop-blur-md ${
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
            <span className="truncate">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container: 100% Fluid on Narrow Views, Ergonomic on Desktop */}
      <div className="w-full max-w-5xl flex-1 flex flex-col min-w-0">
        <div className="w-full max-w-full flex-1 bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/90 p-3 sm:p-6 lg:p-8 flex flex-col transition-all min-w-0 overflow-hidden">
          {/* Header & Navbar */}
          <Navbar
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

          {/* Filter Bar, Search & Sort */}
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            counts={counts}
          />

          {/* List Item Tugas */}
          <div className="space-y-2.5 sm:space-y-3 flex-1 min-w-0 w-full max-w-full">
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
