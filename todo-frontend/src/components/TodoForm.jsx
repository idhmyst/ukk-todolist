import React, { useState } from 'react';
import {
  Plus,
  Loader2,
  Sparkles,
  AlertCircle,
  Bell,
  Calendar,
  Clock,
  ChevronDown,
  X,
} from 'lucide-react';
import { parseLocalDate, getMinDateString } from '../utils/todoHelpers';

const PRIORITY_OPTIONS = [
  {
    value: 'low',
    label: 'Low',
    sublabel: 'Santai',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-400 font-bold',
    dot: 'bg-emerald-500',
  },
  {
    value: 'medium',
    label: 'Medium',
    sublabel: 'Standar',
    classes: 'bg-amber-50 text-amber-900 border-amber-300 focus:ring-amber-400 font-bold',
    dot: 'bg-amber-500',
  },
  {
    value: 'high',
    label: 'High',
    sublabel: 'Mendesak',
    classes: 'bg-rose-50 text-rose-800 border-rose-300 focus:ring-rose-400 font-bold',
    dot: 'bg-rose-500',
  },
];

export default function TodoForm({ onAddTodo, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState('30m');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Judul tugas tidak boleh kosong.');
      return;
    }

    // Format dan validasi tanggal & jam deadline
    let finalDueDate = '';
    if (dueDate) {
      const timePart = dueTime || '23:59';
      finalDueDate = `${dueDate}T${timePart}`;
      const parsed = parseLocalDate(finalDueDate);
      if (parsed) {
        const now = new Date();
        // Toleransi 1 menit
        if (parsed.getTime() < now.getTime() - 60000) {
          setValidationError('Tenggat waktu tidak boleh tanggal atau jam yang sudah lewat!');
          return;
        }
      }
    }

    setValidationError('');
    const success = await onAddTodo(trimmedTitle, priority, finalDueDate, reminder);
    if (success) {
      setTitle('');
      setPriority('medium');
      setDueDate('');
      setDueTime('');
      setReminder('30m');
    }
  };

  const currentPriorityObj =
    PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[1];

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-5 lg:p-6 bg-slate-50/90 rounded-2xl border-2 border-slate-200/90 mb-5 sm:mb-7 transition-all shadow-xs w-full max-w-full min-w-0"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
          Tambah Tugas Baru
        </h2>
      </div>

      <div className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0">
        {/* Input Text Title */}
        <div className="w-full max-w-full min-w-0">
          <label htmlFor="todo-title" className="sr-only">
            Judul Tugas
          </label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError && e.target.value.trim()) {
                setValidationError('');
              }
            }}
            placeholder="Apa tugas yang ingin kamu selesaikan?"
            disabled={isSubmitting}
            className={`w-full max-w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border-2 text-xs sm:text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all ${
              validationError
                ? 'border-rose-400 focus:ring-rose-100 focus:border-rose-500'
                : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
            }`}
          />
          {validationError && (
            <p className="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </p>
          )}
        </div>

        {/* Modern Meta Toolbar: Priority, Unified Deadline (Date + Time), Reminder & Submit Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-1 w-full max-w-full min-w-0">
          {/* Controls Group */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            {/* 1. Priority Select */}
            <div className="relative min-w-[155px]">
              <label htmlFor="todo-priority" className="sr-only">
                Prioritas Tugas
              </label>
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
                className={`w-full appearance-none pl-7 pr-8 py-2.5 text-xs sm:text-sm font-bold rounded-xl border-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all ${currentPriorityObj.classes}`}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-800 font-semibold">
                    {opt.label} ({opt.sublabel})
                  </option>
                ))}
              </select>
              <span
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${currentPriorityObj.dot}`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Unified Deadline Pill (Tanggal & Jam tergabung rapi) */}
            <div className="flex items-center rounded-xl border-2 border-slate-200 bg-white shadow-2xs hover:border-slate-300 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 transition-all overflow-hidden max-w-full">
              {/* Tanggal */}
              <div className="flex items-center pl-2.5 pr-1.5 py-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 mr-1.5 flex-shrink-0" />
                <input
                  id="todo-due-date"
                  type="date"
                  value={dueDate}
                  min={getMinDateString()}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (!dueTime && e.target.value) {
                      setDueTime('23:59');
                    }
                    if (validationError) setValidationError('');
                  }}
                  disabled={isSubmitting}
                  className="text-xs sm:text-sm font-semibold text-slate-800 bg-transparent outline-none cursor-pointer py-1"
                  title="Pilih tanggal deadline"
                />
              </div>

              {/* Garis Pemisah Antara Tanggal & Jam */}
              <div className="h-5 w-[1.5px] bg-slate-200 flex-shrink-0" />

              {/* Jam (Waktu) */}
              <div className="flex items-center pl-2 pr-2.5 py-1.5 bg-slate-50/70">
                <Clock className="w-3.5 h-3.5 text-indigo-500 mr-1.5 flex-shrink-0" />
                <input
                  id="todo-due-time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => {
                    setDueTime(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  disabled={isSubmitting || !dueDate}
                  className="text-xs sm:text-sm font-semibold text-slate-800 bg-transparent outline-none cursor-pointer py-1 disabled:opacity-40"
                  title={dueDate ? 'Pilih jam deadline' : 'Pilih tanggal terlebih dahulu'}
                />
              </div>

              {/* Tombol Clear Deadline */}
              {dueDate && (
                <button
                  type="button"
                  onClick={() => {
                    setDueDate('');
                    setDueTime('');
                  }}
                  className="px-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Hapus deadline"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3. Pengingat Notifikasi (Cukup Ruang, Tanpa Teks Terpotong) */}
            <div className="relative min-w-[160px]">
              <label htmlFor="todo-reminder" className="sr-only">
                Pengingat Notifikasi
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                  <Bell className="w-4 h-4" />
                </div>
                <select
                  id="todo-reminder"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full appearance-none pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 cursor-pointer shadow-2xs hover:border-slate-300 transition-all"
                  title="Pilih kapan notifikasi deadline berbunyi"
                >
                  <option value="30m">Notif: 30 Menit</option>
                  <option value="1h">Notif: 1 Jam</option>
                  <option value="5m">Notif: 5 Menit</option>
                  <option value="none">Tanpa Notifikasi</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Tombol Submit Tambah Tugas (Rapi & Proporsional) */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-200 cursor-pointer whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3] flex-shrink-0" />
                  <span>Tambah Tugas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Jam Presets */}
        {dueDate && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-600">
            <span className="font-bold text-slate-500 text-[11px] flex items-center gap-1 mr-0.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Pilihan Jam:
            </span>
            {[
              { label: '09:00 (Pagi)', val: '09:00' },
              { label: '12:00 (Siang)', val: '12:00' },
              { label: '17:00 (Sore)', val: '17:00' },
              { label: '21:00 (Malam)', val: '21:00' },
              { label: '23:59 (Akhir Hari)', val: '23:59' },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => {
                  setDueTime(preset.val);
                  if (validationError) setValidationError('');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  dueTime === preset.val
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
