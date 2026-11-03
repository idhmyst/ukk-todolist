import React, { useState } from 'react';
import { Plus, Loader2, Sparkles, Calendar, AlertCircle } from 'lucide-react';

const PRIORITY_OPTIONS = [
  {
    value: 'low',
    label: 'Low',
    sublabel: 'Santai',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-400',
    dot: 'bg-emerald-500',
  },
  {
    value: 'medium',
    label: 'Medium',
    sublabel: 'Standar',
    classes: 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400',
    dot: 'bg-amber-500',
  },
  {
    value: 'high',
    label: 'High',
    sublabel: 'Mendesak',
    classes: 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-400',
    dot: 'bg-rose-500',
  },
];

export default function TodoForm({ onAddTodo, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Judul tugas tidak boleh kosong.');
      return;
    }

    setValidationError('');
    const success = await onAddTodo(trimmedTitle, priority, dueDate);
    if (success) {
      setTitle('');
      setPriority('medium');
      setDueDate('');
    }
  };

  const currentPriorityObj =
    PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[1];

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 mb-7 transition-all shadow-xs hover:shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
          Tambah Tugas Baru
        </h2>
      </div>

      <div className="space-y-3.5">
        {/* Input Text Title */}
        <div>
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
            placeholder="Contoh: Menyelesaikan laporan bab 4 UKK PPLG..."
            disabled={isSubmitting}
            className={`w-full px-4 py-2.5 rounded-xl bg-white border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
              validationError
                ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
            }`}
          />
          {validationError && (
            <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validationError}</span>
            </p>
          )}
        </div>

        {/* Priority & Due Date Inputs & Submit Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Priority Select (4 cols) */}
          <div className="sm:col-span-4">
            <div className="relative">
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
                className={`w-full appearance-none pl-7 pr-8 py-2 text-xs font-semibold rounded-xl border cursor-pointer focus:outline-none focus:ring-2 transition-all ${currentPriorityObj.classes}`}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                    {opt.label} ({opt.sublabel})
                  </option>
                ))}
              </select>
              <span
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${currentPriorityObj.dot}`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Due Date Input (4 cols) */}
          <div className="sm:col-span-4">
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                title="Tenggat waktu (Due Date) opsional"
              />
            </div>
          </div>

          {/* Submit Button (4 cols) */}
          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
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
