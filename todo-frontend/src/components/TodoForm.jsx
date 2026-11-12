import React, { useState } from 'react';
import { Plus, Loader2, Sparkles, AlertCircle, Bell } from 'lucide-react';

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
  const [reminder, setReminder] = useState('30m');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Judul tugas tidak boleh kosong.');
      return;
    }

    setValidationError('');
    const success = await onAddTodo(trimmedTitle, priority, dueDate, reminder);
    if (success) {
      setTitle('');
      setPriority('medium');
      setDueDate('');
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

        {/* Priority, Due Date, Reminder Inputs & Submit Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-3 pt-0.5 w-full max-w-full min-w-0">
          {/* Priority Select */}
          <div className="w-full max-w-full min-w-0 sm:col-span-1 lg:col-span-3 relative">
            <label htmlFor="todo-priority" className="sr-only">
              Prioritas Tugas
            </label>
            <select
              id="todo-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
              className={`w-full max-w-full min-w-0 appearance-none pl-7 pr-7 py-2.5 text-xs sm:text-sm font-bold rounded-xl border-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all ${currentPriorityObj.classes}`}
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
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Due Date & Time Input */}
          <div className="w-full max-w-full min-w-0 sm:col-span-1 lg:col-span-4 relative">
            <label htmlFor="todo-due-date" className="sr-only">
              Tenggat Waktu
            </label>
            <input
              id="todo-due-date"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full max-w-full min-w-0 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 cursor-pointer"
              title="Tenggat waktu (Due Date & Jam)"
            />
          </div>

          {/* Reminder Select (1 jam, 30 menit, 5 menit) */}
          <div className="w-full max-w-full min-w-0 sm:col-span-1 lg:col-span-3 relative">
            <label htmlFor="todo-reminder" className="sr-only">
              Pengingat Notifikasi
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                <Bell className="w-4 h-4" />
              </div>
              <select
                id="todo-reminder"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                disabled={isSubmitting}
                className="w-full max-w-full min-w-0 appearance-none pl-8 pr-7 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 cursor-pointer"
                title="Pilih kapan notifikasi deadline berbunyi"
              >
                <option value="30m">Notif: 30 Menit</option>
                <option value="1h">Notif: 1 Jam</option>
                <option value="5m">Notif: 5 Menit</option>
                <option value="none">Tanpa Notifikasi</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full max-w-full min-w-0 sm:col-span-1 lg:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full max-w-full min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-200 cursor-pointer"
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
      </div>
    </form>
  );
}
