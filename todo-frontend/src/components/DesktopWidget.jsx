import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Check,
  Plus,
  Calendar,
  Clock,
  RefreshCw,
  Loader2,
  X,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Pin,
  PinOff,
} from 'lucide-react';

export default function DesktopWidget({
  todos,
  onToggleStatus,
  onAddTodo,
  onRefresh,
  isRefreshing,
  onExitWidget,
  isStandalone = false,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [showAddInput, setShowAddInput] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const collapseTimeoutRef = useRef(null);

  // Update jam real-time setiap detik
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handler auto-collapse saat mouse meninggalkan widget (jika tidak di-pin)
  const handleMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      collapseTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 700);
    }
  };

  // Hitung jumlah tugas
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.is_completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Filter tugas aktif
  const activeTodos = useMemo(() => {
    return todos.filter((t) => !t.is_completed);
  }, [todos]);

  // Generate 7 hari kalender minggu ini
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Senin, 6 = Minggu
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);

    const days = [];
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        name: dayNames[i],
        date: d.getDate(),
        isToday: d.toDateString() === now.toDateString(),
      });
    }
    return days;
  }, [currentTime]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const success = await onAddTodo(quickTitle.trim(), quickPriority, todayStr);
      if (success) {
        setQuickTitle('');
        setShowAddInput(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedClock = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedHeaderDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedMonthYear = currentTime.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out select-none ${
        isExpanded
          ? 'w-[96vw] max-w-4xl -translate-y-0 opacity-100'
          : 'w-auto -translate-y-0 opacity-95'
      }`}
    >
      {/* 1. TAMPILAN COMPACT / TERTUTUP (SEMBUNYI DI ATAS DESKTOP - SLIM NOTCH) */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          onMouseEnter={() => setIsExpanded(true)}
          title="Klik atau sorot kursor untuk membuka widget"
          className="flex items-center gap-2.5 px-4 py-2 bg-zinc-950/95 text-white rounded-b-2xl border-x border-b border-zinc-700/80 shadow-2xl backdrop-blur-2xl hover:bg-zinc-900 transition-all cursor-pointer group ring-1 ring-white/10"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black tracking-tight">Kelarin.</span>
          <span className="text-[11px] text-zinc-400 font-bold">
            {completedTasks}/{totalTasks} Selesai
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-xs font-mono font-bold text-amber-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
            {formattedClock}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-700/50 group-hover:bg-indigo-900 transition-colors">
            <span>Buka</span>
            <ChevronDown className="w-3 h-3 transition-transform group-hover:translate-y-0.5" />
          </div>
        </button>
      ) : (
        /* 2. TAMPILAN EXPANDED / TERBUKA PENUH (DYNAMIC ISLAND NOTCH) */
        <div className="w-full bg-zinc-950/95 text-white rounded-b-3xl border-x border-b border-zinc-700/80 shadow-2xl backdrop-blur-2xl p-3 sm:p-4 transition-all ring-1 ring-white/10 animate-in slide-in-from-top-6 duration-300">
          {/* Header Micro Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-zinc-100">Kelarin. Island</span>
              <span className="text-zinc-500">•</span>
              <span className="font-medium text-zinc-300">{formattedHeaderDate}</span>
              <span className="font-mono font-bold text-amber-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                {formattedClock}
              </span>
            </div>

            {/* Controls: Pin, Sembunyikan, Refresh, Mode Web */}
            <div className="flex items-center gap-1.5">
              {/* Tombol Pin / Auto-hide */}
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? 'Lepas Pin (Sembunyi otomatis saat mouse keluar)' : 'Kunci Terbuka (Pin agar tidak sembunyi otomatis)'}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                  isPinned
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {isPinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                <span className="hidden sm:inline">{isPinned ? 'Terkunci' : 'Auto-hide'}</span>
              </button>

              {/* Tombol Sembunyikan ke Atas (Collapse Notch) */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                title="Sembunyikan ke atas layar (Notch)"
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronUp className="w-3 h-3 text-indigo-400" />
                <span>Sembunyikan</span>
              </button>

              {/* Tombol Refresh */}
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Sinkronisasi data"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`}
                />
              </button>

              {/* Tombol Mode Penuh */}
              <button
                type="button"
                onClick={onExitWidget}
                title="Kembali ke tampilan web penuh"
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Mode Web</span>
              </button>
            </div>
          </div>

          {/* Main 3-Column Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Kolom 1: Progress Pencapaian & Quick Add */}
            <div className="md:col-span-4 bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800/90 flex flex-col justify-between h-full min-h-[110px]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">
                    Pencapaian Tugas
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-white">{completedTasks}</span>
                    <span className="text-xl font-bold text-zinc-500">/{totalTasks}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {pendingTasks === 0 && totalTasks > 0
                      ? 'Semua tuntas!'
                      : `${pendingTasks} tugas menunggu`}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/80">
                  <span className="text-xs font-black text-indigo-400">{progressPercent}%</span>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase">Beres</span>
                </div>
              </div>

              {/* Quick Add Section */}
              <div className="mt-2 pt-2 border-t border-zinc-800/80">
                {showAddInput ? (
                  <form onSubmit={handleQuickAdd} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder="Ketik tugas cepat..."
                      autoFocus
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={quickPriority}
                      onChange={(e) => setQuickPriority(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-1 py-1 text-[10px] font-bold text-zinc-300 focus:outline-none"
                    >
                      <option value="high">High</option>
                      <option value="medium">Med</option>
                      <option value="low">Low</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSubmitting || !quickTitle.trim()}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'OK'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddInput(false)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddInput(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 rounded-xl border border-indigo-800/40 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Tugas Cepat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Kolom 2: Tugas Mendesak */}
            <div className="md:col-span-4 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800/90 h-full min-h-[110px] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-800/60">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">
                  Tugas Mendesak
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded-full">
                  {activeTodos.length}
                </span>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[80px] pr-1">
                {activeTodos.length === 0 ? (
                  <div className="py-4 text-center text-xs text-zinc-500 font-medium">
                    Semua tugas beres ✨
                  </div>
                ) : (
                  activeTodos.slice(0, 4).map((todo) => {
                    const priorityKey = (todo.priority || 'medium').toLowerCase();
                    const dotColor =
                      priorityKey === 'high'
                        ? 'bg-rose-500 ring-rose-900'
                        : priorityKey === 'low'
                        ? 'bg-emerald-500 ring-emerald-900'
                        : 'bg-amber-500 ring-amber-900';

                    return (
                      <div
                        key={todo.id}
                        onClick={() => onToggleStatus(todo.id, true)}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800/90 transition-colors cursor-pointer group"
                      >
                        <div className="w-3.5 h-3.5 rounded border border-zinc-600 group-hover:border-indigo-400 flex items-center justify-center flex-shrink-0">
                          {todo.is_completed && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                        </div>
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate flex-1">
                          {todo.title}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ring-2 ${dotColor} flex-shrink-0`} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Kolom 3: Mini Kalender Minggu Ini */}
            <div className="md:col-span-4 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800/90 h-full min-h-[110px] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">
                  {formattedMonthYear}
                </span>
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-800/50">
                  Minggu Ini
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center pt-1">
                {weekDays.map((d, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center py-1 rounded-xl transition-all ${
                      d.isToday
                        ? 'bg-indigo-600 text-white font-extrabold shadow-sm ring-1 ring-indigo-400'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase">{d.name}</span>
                    <span className="text-xs font-black mt-0.5">{d.date}</span>
                    {d.isToday && <span className="w-1 h-1 rounded-full bg-white mt-0.5" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
