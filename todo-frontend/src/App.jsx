import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import RightFilterPanel from './components/RightFilterPanel';
import TodoToolbar from './components/TodoToolbar';
import TodoRowItem from './components/TodoRowItem';
import AddTaskModal from './components/AddTaskModal';
import EditTaskModal from './components/EditTaskModal';
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

  // Layout & UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // Filters, Search, & Sorting
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'my_tasks' | 'favorites' | 'done' | 'deleted'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'priority' | 'alphabetical'
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  // Local storage untuk menyimpan status bintang (Favorites) & kategori tambahan
  const [metaMap, setMetaMap] = useState(() => {
    try {
      const saved = localStorage.getItem('ukk_todo_meta');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveMetaMap = (newMap) => {
    setMetaMap(newMap);
    try {
      localStorage.setItem('ukk_todo_meta', JSON.stringify(newMap));
    } catch (e) {
      console.error('Failed to save meta to localStorage', e);
    }
  };

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

  useEffect(() => {
    fetchTodosData(true);
  }, [fetchTodosData]);

  // Handler: Tambah Todo baru (POST /api/todos)
  const handleAddTodo = async (title, priority, category) => {
    setIsSubmitting(true);
    try {
      const newTodo = await createTodo(title, priority);
      // Simpan metadata kategori
      const nextMeta = {
        ...metaMap,
        [newTodo.id]: { is_favorite: false, category: category || 'Coding' },
      };
      saveMetaMap(nextMeta);

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

  // Handler: Update Todo (PUT /api/todos/:id)
  const handleUpdateTodo = async (id, payload) => {
    setIsSubmitting(true);
    try {
      const updated = await updateTodo(id, {
        title: payload.title,
        priority: payload.priority,
      });

      // Update metadata kategori jika ada
      if (payload.category) {
        saveMetaMap({
          ...metaMap,
          [id]: { ...(metaMap[id] || {}), category: payload.category },
        });
      }

      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast('Tugas berhasil diperbarui', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Gagal mengupdate tugas', 'error');
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

  // Handler: Toggle Bintang / Favorite ⭐
  const handleToggleFavorite = (id) => {
    const currentFav = metaMap[id]?.is_favorite || false;
    const nextMeta = {
      ...metaMap,
      [id]: { ...(metaMap[id] || {}), is_favorite: !currentFav },
    };
    saveMetaMap(nextMeta);
    showToast(
      !currentFav ? 'Tugas ditambahkan ke Favorit ⭐' : 'Tugas dihapus dari Favorit',
      'success'
    );
  };

  // Handler: Hapus Todo (DELETE /api/todos/:id)
  const handleDeleteTodo = async (id) => {
    const previousTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));

    try {
      await deleteTodo(id);
      showToast('Tugas berhasil dihapus', 'success');
    } catch (err) {
      setTodos(previousTodos);
      showToast(err.message || 'Gagal menghapus tugas', 'error');
    }
  };

  // Handler: Bulk Complete
  const handleBulkComplete = async () => {
    if (selectedIds.length === 0) return;
    const targets = [...selectedIds];
    setSelectedIds([]);

    for (const id of targets) {
      try {
        await updateTodo(id, { is_completed: true });
      } catch (e) {
        console.error(e);
      }
    }
    fetchTodosData(false);
    showToast(`${targets.length} tugas ditandai selesai!`, 'success');
  };

  // Handler: Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const targets = [...selectedIds];
    setSelectedIds([]);

    for (const id of targets) {
      try {
        await deleteTodo(id);
      } catch (e) {
        console.error(e);
      }
    }
    fetchTodosData(false);
    showToast(`${targets.length} tugas berhasil dihapus!`, 'success');
  };

  // Merging Todos dengan Metadata (Favorites & Category)
  const enrichedTodos = useMemo(() => {
    return todos.map((todo) => {
      const meta = metaMap[todo.id] || {};
      return {
        ...todo,
        is_favorite: !!meta.is_favorite,
        category: meta.category || (todo.priority === 'high' ? 'Coding' : todo.priority === 'low' ? 'Freelance' : 'Theme Support'),
      };
    });
  }, [todos, metaMap]);

  // Hitung jumlah untuk RightFilterPanel
  const counts = useMemo(() => {
    const all = enrichedTodos.length;
    const done = enrichedTodos.filter((t) => t.is_completed).length;
    const favorites = enrichedTodos.filter((t) => t.is_favorite).length;
    const myTasks = all;
    const deleted = 0;
    return { all, myTasks, favorites, done, deleted };
  }, [enrichedTodos]);

  // Filter & Search Logic
  const filteredAndSortedTodos = useMemo(() => {
    let result = [...enrichedTodos];

    // 1. Right Sidebar Filter
    if (activeFilter === 'done') {
      result = result.filter((t) => t.is_completed);
    } else if (activeFilter === 'favorites') {
      result = result.filter((t) => t.is_favorite);
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.priority.toLowerCase().includes(query)
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.id - a.id;
      }
      if (sortBy === 'oldest') {
        return a.id - b.id;
      }
      if (sortBy === 'priority') {
        const weight = { high: 3, medium: 2, low: 1 };
        return (weight[b.priority] || 2) - (weight[a.priority] || 2);
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [enrichedTodos, activeFilter, searchQuery, sortBy]);

  // Bulk Selection Helpers
  const handleSelectAll = () => {
    setSelectedIds(filteredAndSortedTodos.map((t) => t.id));
  };
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };
  const handleSelectToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] p-2 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased">
      {/* Toast Notification */}
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

      {/* Main Dashboard Canvas (Matches the CakeAdmin Design) */}
      <div className="w-full max-w-7xl bg-white rounded-3xl lg:rounded-[2.5rem] shadow-2xl shadow-indigo-950/5 border border-slate-200/90 overflow-hidden flex flex-col lg:flex-row min-h-[820px]">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeApp="todo"
          activeView="list"
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-[#fafbfe] min-w-0">
          {/* Top Navbar */}
          <TopHeader
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isBackendOnline={isBackendOnline}
            isRefreshing={isLoading}
            onRefresh={() => fetchTodosData(false)}
          />

          {/* Main Body Layout */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 overflow-x-hidden">
            {/* Center: Todo Content Column */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Alert Error jika Backend Go offline */}
              {errorMessage && (
                <ErrorAlert
                  message={errorMessage}
                  onRetry={() => fetchTodosData(true)}
                  isRetrying={isLoading}
                />
              )}

              {/* Control Toolbar */}
              <TodoToolbar
                selectedIds={selectedIds}
                totalItems={filteredAndSortedTodos.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkComplete={handleBulkComplete}
                onBulkDelete={handleBulkDelete}
                sortBy={sortBy}
                onSortChange={setSortBy}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* Todo List Rows */}
              <div className="space-y-2.5 flex-1">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : filteredAndSortedTodos.length === 0 ? (
                  <EmptyState filter={activeFilter} />
                ) : (
                  filteredAndSortedTodos.map((todo) => (
                    <TodoRowItem
                      key={todo.id}
                      todo={todo}
                      isSelected={selectedIds.includes(todo.id)}
                      onSelectToggle={handleSelectToggle}
                      onToggleStatus={handleToggleStatus}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={(target) => setEditingTodo(target)}
                      onDelete={handleDeleteTodo}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: Quick Filter Panel */}
            <RightFilterPanel
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={counts}
            />
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTodo={handleAddTodo}
        isSubmitting={isSubmitting}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
        onUpdateTodo={handleUpdateTodo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
