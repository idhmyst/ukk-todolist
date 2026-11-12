import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import TodoForm from './components/TodoForm';
import FilterBar from './components/FilterBar';
import TodoItem from './components/TodoItem';
import EditModal from './components/EditModal';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import ErrorAlert from './components/ErrorAlert';
import DesktopWidget from './components/DesktopWidget';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  clearCompletedTodos,
} from './services/api';
import {
  sortTodos,
  groupTodosByDate,
  groupTodosByPriority,
  getDeadlineInfo,
} from './utils/todoHelpers';
import {
  playDeadlineRingtone,
  requestNotificationPermission,
  showBrowserNotification,
} from './utils/audioAlert';
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Trash2,
  Check,
  Loader2,
  Bell,
  BellRing,
  Volume2,
  X,
} from 'lucide-react';

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

  // Accordion & Clear Completed States
  const [showCompleted, setShowCompleted] = useState(false);
  const [showClearCompletedModal, setShowClearCompletedModal] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  // Deadline Audio Alert & Notification States
  const notifiedKeysRef = useRef(new Set());
  const [activeAlertTodo, setActiveAlertTodo] = useState(null);

  // Desktop Floating Widget States
  const isUrlWidget = useMemo(() => {
    return new URLSearchParams(window.location.search).get('mode') === 'widget';
  }, []);
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  // Buka widget di jendela melayang desktop independen
  const handlePopoutWidget = () => {
    const width = 880;
    const height = 230;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = 10;
    window.open(
      `${window.location.origin}${window.location.pathname}?mode=widget`,
      'KelarinDesktopWidget',
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=no,resizable=yes`
    );
  };

  // Helper Toast Feedback
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Tes bunyikan nada dering melodi & minta izin notifikasi browser
  const handleTestRingtone = async () => {
    await requestNotificationPermission();
    playDeadlineRingtone();
    showToast('Melodi nada dering pengingat berhasil dibunyikan! 🔔', 'success');
  };

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

  // Interval pengecekan berkala deadline (setiap 10 detik)
  useEffect(() => {
    const checkDeadlines = () => {
      if (!todos || todos.length === 0) return;

      todos.forEach((todo) => {
        // Hanya cek tugas aktif yang memiliki due_date dan reminder bukan 'none'
        if (todo.is_completed || !todo.due_date) return;
        if (todo.reminder === 'none') return;

        const info = getDeadlineInfo(todo.due_date);
        if (!info) return;

        const diffMinutes = info.diffMinutes;
        const reminderSetting = todo.reminder || '30m';

        // Hitung batas ambang pengingat
        let thresholdMinutes = 30;
        if (reminderSetting === '1h') thresholdMinutes = 60;
        else if (reminderSetting === '5m') thresholdMinutes = 5;

        // 1. Kondisi Notifikasi Pengingat (1 jam, 30 menit, atau 5 menit sebelum batas waktu)
        const reminderKey = `remind_${todo.id}_${reminderSetting}`;
        if (diffMinutes <= thresholdMinutes && diffMinutes > 0) {
          if (!notifiedKeysRef.current.has(reminderKey)) {
            notifiedKeysRef.current.add(reminderKey);
            playDeadlineRingtone();
            showBrowserNotification(
              `🔔 Pengingat Deadline: ${todo.title}`,
              `Tersisa ${diffMinutes} menit sebelum tenggat waktu! (${info.formattedDate})`
            );
            setActiveAlertTodo({
              todo,
              diffMinutes,
              type: 'reminder',
            });
          }
        }

        // 2. Kondisi Notifikasi Saat Deadline Tiba / Baru Saja Terlewat (0 s/d -15 menit)
        const dueKey = `due_${todo.id}`;
        if (diffMinutes <= 0 && diffMinutes >= -15) {
          if (!notifiedKeysRef.current.has(dueKey)) {
            notifiedKeysRef.current.add(dueKey);
            playDeadlineRingtone();
            showBrowserNotification(
              `⏰ Tenggat Waktu Tiba: ${todo.title}`,
              `Tenggat waktu tugas ini telah habis! Segera selesaikan tugasmu.`
            );
            setActiveAlertTodo({
              todo,
              diffMinutes,
              type: 'due',
            });
          }
        }
      });
    };

    checkDeadlines();
    const intervalId = setInterval(checkDeadlines, 10000);
    return () => clearInterval(intervalId);
  }, [todos]);

  // Handler: Tambah Todo (POST /api/todos)
  const handleAddTodo = async (title, priority, dueDate, reminder = '30m') => {
    setIsSubmitting(true);
    try {
      const newTodo = await createTodo(title, priority, dueDate, reminder);
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

  // Handler: Bersihkan semua tugas yang sudah selesai (DELETE /api/todos/completed)
  const handleClearCompleted = async () => {
    const completedItems = todos.filter((t) => t.is_completed);
    if (completedItems.length === 0) return;

    setIsClearingCompleted(true);
    const previousTodos = [...todos];

    // Optimistic UI update: langsung hapus tugas selesai dari state
    setTodos((prev) => prev.filter((t) => !t.is_completed));

    try {
      const ids = completedItems.map((t) => t.id);
      await clearCompletedTodos(ids);
      showToast(`${completedItems.length} tugas selesai berhasil dibersihkan`, 'success');
      setShowClearCompletedModal(false);
    } catch (err) {
      setTodos(previousTodos);
      showToast(err.message || 'Gagal membersihkan tugas selesai', 'error');
    } finally {
      setIsClearingCompleted(false);
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

  // Pisahkan tugas aktif dan tugas selesai untuk tampilan tab 'all'
  const activeTodos = useMemo(() => {
    return filteredTodos.filter((t) => !t.is_completed);
  }, [filteredTodos]);

  const completedTodos = useMemo(() => {
    return filteredTodos.filter((t) => t.is_completed);
  }, [filteredTodos]);

  // Kelompokkan tugas aktif berdasarkan mode switch (Urgensi vs Deadline Per Hari)
  const groupedSections = useMemo(() => {
    const listToGroup = activeFilter === 'pending' ? filteredTodos : activeTodos;
    if (sortBy === 'deadline') {
      return groupTodosByDate(listToGroup);
    }
    return groupTodosByPriority(listToGroup);
  }, [activeTodos, filteredTodos, activeFilter, sortBy]);

  useEffect(() => {
    if (isUrlWidget) {
      document.body.style.backgroundColor = '#09090b';
      document.body.style.backgroundImage = 'none';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
    }
  }, [isUrlWidget]);

  // Jika aplikasi dibuka dalam mode pop-up widget desktop murni (?mode=widget)
  if (isUrlWidget) {
    return (
      <main className="h-screen w-full bg-[#09090b] text-white p-2 sm:p-3 flex flex-col justify-start overflow-hidden">
        <DesktopWidget
          todos={todos}
          onToggleStatus={handleToggleStatus}
          onAddTodo={handleAddTodo}
          onRefresh={() => fetchTodosData(false)}
          isRefreshing={isLoading}
          onExitWidget={() => {
            window.location.href = window.location.pathname;
          }}
          isStandalone={true}
        />
      </main>
    );
  }

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

      {/* Floating Active Deadline Alert Banner with Ringtone Animation */}
      {activeAlertTodo && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-3 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-950/95 text-white rounded-2xl p-4 shadow-2xl border-2 border-indigo-500 ring-4 ring-indigo-500/20 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg animate-bounce flex-shrink-0">
                  <BellRing className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                      {activeAlertTodo.type === 'due' ? 'Tenggat Waktu Tiba' : 'Pengingat Deadline'}
                    </span>
                    <span className="text-xs text-indigo-200 font-bold">
                      {activeAlertTodo.diffMinutes > 0
                        ? `Sisa ${activeAlertTodo.diffMinutes} menit lagi!`
                        : 'Waktu telah habis!'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                    {activeAlertTodo.todo.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tenggat: {activeAlertTodo.todo.due_date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAlertTodo(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup banner pengingat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playDeadlineRingtone();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bunyikan Nada</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleStatus(activeAlertTodo.todo.id, true);
                  setActiveAlertTodo(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tandai Selesai</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Notch Desktop Widget Overlay */}
      {isWidgetMode && (
        <DesktopWidget
          todos={todos}
          onToggleStatus={handleToggleStatus}
          onAddTodo={handleAddTodo}
          onRefresh={() => fetchTodosData(false)}
          isRefreshing={isLoading}
          onExitWidget={() => setIsWidgetMode(false)}
          isStandalone={false}
        />
      )}

      {/* Main Container: 100% Fluid on Narrow Views, Ergonomic on Desktop */}
      <div className="w-full max-w-5xl flex-1 flex flex-col min-w-0">
        <div className="w-full max-w-full flex-1 bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/90 p-3 sm:p-6 lg:p-8 flex flex-col transition-all min-w-0 overflow-hidden">
          {/* Header & Navbar */}
          <Navbar
            isRefreshing={isLoading}
            onRefresh={() => fetchTodosData(false)}
            onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
            onTestRingtone={handleTestRingtone}
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
            ) : activeFilter === 'all' ? (
              <div className="space-y-3 flex-1 min-w-0 w-full max-w-full">
                {/* Active Todos List (Grouped by Urgency or Deadline) */}
                {activeTodos.length > 0 ? (
                  <div className="space-y-4">
                    {groupedSections.map((section) => (
                      <div key={section.id} className="space-y-2">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 pt-1 pb-0.5 first:pt-0">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            {section.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${section.badgeClass}`}>
                            {section.items.length}
                          </span>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Section Items */}
                        <div className="space-y-2.5 sm:space-y-3">
                          {section.items.map((todo) => (
                            <TodoItem
                              key={todo.id}
                              todo={todo}
                              onToggleStatus={handleToggleStatus}
                              onEdit={(target) => setEditingTodo(target)}
                              onDelete={handleDeleteTodo}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 bg-slate-50/80 border border-dashed border-slate-300 rounded-2xl text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Semua tugas aktif sudah selesai!
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kerja bagus, tidak ada tanggungan tugas saat ini.
                    </p>
                  </div>
                )}

                {/* Accordion Tugas Selesai */}
                {completedTodos.length > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between py-1 px-0.5">
                      <button
                        type="button"
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group select-none"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
                            showCompleted ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                        <span>Tugas Selesai ({completedTodos.length})</span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-slate-200 transition-colors">
                          {showCompleted ? 'Sembunyikan' : 'Tampilkan'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowClearCompletedModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Bersihkan semua tugas yang telah selesai"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bersihkan Selesai</span>
                        <span className="sm:hidden">Bersihkan</span>
                      </button>
                    </div>

                    {showCompleted && (
                      <div className="space-y-2.5 sm:space-y-3 mt-2.5 transition-all">
                        {completedTodos.map((todo) => (
                          <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggleStatus={handleToggleStatus}
                            onEdit={(target) => setEditingTodo(target)}
                            onDelete={handleDeleteTodo}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeFilter === 'completed' ? (
              <div className="space-y-3 flex-1 min-w-0 w-full max-w-full">
                <div className="flex items-center justify-between pb-1 px-0.5 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-500">
                    Menampilkan {filteredTodos.length} tugas selesai
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowClearCompletedModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bersihkan Semua</span>
                  </button>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {filteredTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleStatus={handleToggleStatus}
                      onEdit={(target) => setEditingTodo(target)}
                      onDelete={handleDeleteTodo}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-1 min-w-0 w-full max-w-full">
                {groupedSections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center gap-2 pt-1 pb-0.5 first:pt-0">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                        {section.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${section.badgeClass}`}>
                        {section.items.length}
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      {section.items.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggleStatus={handleToggleStatus}
                          onEdit={(target) => setEditingTodo(target)}
                          onDelete={handleDeleteTodo}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Bersihkan Semua Selesai */}
      {showClearCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isClearingCompleted && setShowClearCompletedModal(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Bersihkan Tugas Selesai?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mt-1.5 leading-relaxed">
              Apakah kamu yakin ingin menghapus{' '}
              <strong>{counts.completed} tugas</strong> yang telah selesai? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                disabled={isClearingCompleted}
                onClick={() => setShowClearCompletedModal(false)}
                className="flex-1 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isClearingCompleted}
                onClick={handleClearCompleted}
                className="flex-1 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isClearingCompleted ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  'Ya, Bersihkan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
