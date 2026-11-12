import React, { useState, useMemo } from 'react';
import {
  getCalendarDays,
  formatDateKey,
  getTodosByDateMap,
  getDeadlineInfo,
  INDO_MONTH_NAMES,
} from '../utils/todoHelpers';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Circle,
  Plus,
  X,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function CalendarView({
  todos = [],
  selectedDate,
  onSelectDate,
  onAddTodoForDate,
  onToggleStatus,
  onEditTodo,
  onDeleteTodo,
}) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Matriks hari dalam bulan yang sedang dibuka
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Pemetaan dateKey (YYYY-MM-DD) -> daftar tugas
  const todosByDate = useMemo(() => {
    return getTodosByDateMap(todos);
  }, [todos]);

  // Navigasi Bulan
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    if (onSelectDate) {
      onSelectDate(formatDateKey(now));
    }
  };

  // Tugas pada tanggal yang sedang dipilih
  const activeDateKey = selectedDate || formatDateKey(today);
  const selectedDateTodos = useMemo(() => {
    return todosByDate.get(activeDateKey) || [];
  }, [todosByDate, activeDateKey]);

  // Periksa apakah ada tugas mendesak atau terlewat pada tanggal yang dipilih
  const selectedDayUrgentCount = useMemo(() => {
    return selectedDateTodos.filter((t) => {
      if (t.is_completed) return false;
      const info = getDeadlineInfo(t.due_date);
      return t.priority === 'high' || (info && info.diffMinutes <= 60);
    }).length;
  }, [selectedDateTodos]);

  // Format tanggal terpilih yang ramah dibaca
  const readableSelectedDate = useMemo(() => {
    if (!activeDateKey) return '';
    const parts = activeDateKey.split('-');
    if (parts.length !== 3) return activeDateKey;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  }, [activeDateKey]);

  return (
    <div className="space-y-6">
      {/* Kartu Kalender Interaktif */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
        {/* Header Kalender: Bulan, Tahun & Kontrol */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {INDO_MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pilih tanggal untuk melihat jadwal dan notifikasi tugas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 transition-colors cursor-pointer"
            >
              Hari Ini
            </button>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Header Hari (Sen - Min) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center pt-4 pb-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((dayName, idx) => (
            <div
              key={dayName}
              className={`text-xs font-bold py-1 ${
                idx >= 5 ? 'text-rose-500' : 'text-slate-400'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Grid Hari Kalender */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((item) => {
            const dayTodos = todosByDate.get(item.dateKey) || [];
            const hasTodos = dayTodos.length > 0;
            const isSelected = item.dateKey === activeDateKey;

            // Cek apakah ada tugas yang memiliki urgensi tinggi / deadline mendekat
            const hasUrgent = dayTodos.some((t) => {
              if (t.is_completed) return false;
              const info = getDeadlineInfo(t.due_date);
              return t.priority === 'high' || (info && info.diffMinutes <= 60);
            });

            const allCompleted = hasTodos && dayTodos.every((t) => t.is_completed);

            return (
              <button
                key={item.dateKey}
                type="button"
                onClick={() => onSelectDate && onSelectDate(item.dateKey)}
                className={`relative min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between items-start transition-all text-left cursor-pointer group ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600'
                    : item.isCurrentMonth
                    ? item.isToday
                      ? 'bg-indigo-50/70 border-2 border-indigo-300 text-slate-800 hover:bg-indigo-100/60'
                      : 'bg-slate-50/80 border border-slate-200/60 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                    : 'bg-slate-50/30 border border-transparent text-slate-300 hover:bg-slate-100/40'
                }`}
              >
                {/* Tanggal & Indikator Alert */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isSelected
                        ? 'text-white'
                        : item.isToday
                        ? 'text-indigo-600 font-extrabold'
                        : item.isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {item.dayNum}
                  </span>

                  {/* Pulsing Alert Icon jika ada jadwal mendesak */}
                  {hasUrgent && (
                    <span
                      className={`flex items-center justify-center p-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                      }`}
                      title="Ada jadwal mendesak pada hari ini!"
                    >
                      <Bell className="w-3 h-3 animate-pulse" />
                    </span>
                  )}
                </div>

                {/* Indikator Titik/Badge Tugas di Hari Ini */}
                <div className="w-full mt-1">
                  {hasTodos ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1 flex-wrap">
                        {dayTodos.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected
                                ? t.is_completed
                                  ? 'bg-white/40'
                                  : 'bg-white'
                                : t.is_completed
                                ? 'bg-slate-300'
                                : t.priority === 'high'
                                ? 'bg-rose-500'
                                : t.priority === 'medium'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected
                            ? 'text-white/80'
                            : allCompleted
                            ? 'text-emerald-600 font-semibold'
                            : 'text-slate-500'
                        }`}
                      >
                        {dayTodos.length}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-transparent select-none">-</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legenda Kalender */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Prioritas Mendesak
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Prioritas Standar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Prioritas Santai
            </span>
          </div>
          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
            <Bell className="w-3.5 h-3.5" />
            Ikon Lonceng = Jadwal Mendekati Deadline
          </span>
        </div>
      </div>

      {/* Panel Rincian Jadwal & Alert pada Tanggal Terpilih */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                Jadwal Hari Terpilih
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">
                {activeDateKey}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-800 capitalize mt-1">
              {readableSelectedDate}
            </h4>
          </div>

          <button
            type="button"
            onClick={() => onAddTodoForDate && onAddTodoForDate(activeDateKey)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah di Tanggal Ini</span>
          </button>
        </div>

        {/* ALERT: Muncul jika ada jadwal tugas pada hari ini */}
        {selectedDateTodos.length > 0 ? (
          <div className="mt-4 space-y-4">
            {/* Banner Alert Notifikasi Jadwal */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                selectedDayUrgentCount > 0
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
              }`}
            >
              <div
                className={`p-2 rounded-xl ${
                  selectedDayUrgentCount > 0
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-indigo-100 text-indigo-600'
                } flex-shrink-0`}
              >
                {selectedDayUrgentCount > 0 ? (
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold">
                    {selectedDayUrgentCount > 0
                      ? 'Peringatan Jadwal Deadline Mendekat!'
                      : 'Tugas Terjadwal Hari Ini'}
                  </h5>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedDayUrgentCount > 0
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-indigo-200 text-indigo-800'
                    }`}
                  >
                    {selectedDateTodos.length} Tugas
                  </span>
                </div>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                  {selectedDayUrgentCount > 0
                    ? `Perhatian! Terdapat ${selectedDayUrgentCount} tugas mendesak yang memiliki batas waktu dekat pada hari ini. Pastikan untuk segera menyelesaikannya!`
                    : `Ada ${selectedDateTodos.length} tugas yang direncanakan untuk hari ini. Pantau terus agar semua terselesaikan tepat waktu.`}
                </p>
              </div>
            </div>

            {/* List Tugas di Tanggal Tersebut */}
            <div className="space-y-2.5">
              {selectedDateTodos.map((todo) => {
                const info = getDeadlineInfo(todo.due_date);
                const isHigh = todo.priority === 'high';
                const isMedium = todo.priority === 'medium';

                return (
                  <div
                    key={todo.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      todo.is_completed
                        ? 'bg-slate-50/60 border-slate-200/60 opacity-60'
                        : isHigh
                        ? 'bg-rose-50/40 border-rose-200/80 shadow-xs'
                        : 'bg-white border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleStatus && onToggleStatus(todo.id, !todo.is_completed)}
                        className="cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                      >
                        {todo.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            todo.is_completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800'
                          }`}
                        >
                          {todo.title}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap mt-1 text-xs">
                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isHigh
                                ? 'bg-rose-100 text-rose-700'
                                : isMedium
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {todo.priority}
                          </span>

                          {/* Time */}
                          {todo.due_date && (
                            <span className="text-slate-500 flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {info?.formattedDate || todo.due_date}
                            </span>
                          )}

                          {/* Reminder Badge */}
                          {todo.reminder && todo.reminder !== 'none' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                              🔔 {todo.reminder}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditTodo && onEditTodo(todo)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit tugas"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTodo && onDeleteTodo(todo.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus tugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Tidak ada jadwal tugas pada tanggal ini
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hari ini bebas tugas! Kamu bisa menjadwalkan tugas baru di tanggal ini dengan tombol di atas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
