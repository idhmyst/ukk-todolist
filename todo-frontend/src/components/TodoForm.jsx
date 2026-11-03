import React, { useState } from 'react';
import { Plus, Loader2, Sparkles } from 'lucide-react';

const PRIORITY_OPTIONS = [
  {
    value: 'low',
    label: 'Low',
    desc: 'Santai',
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  {
    value: 'medium',
    label: 'Medium',
    desc: 'Standar',
    bgBadge: 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400',
    dotColor: 'bg-amber-500',
  },
  {
    value: 'high',
    label: 'High',
    desc: 'Mendesak',
    bgBadge: 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-400',
    dotColor: 'bg-rose-500',
  },
];

export default function TodoForm({ onAddTodo, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Judul tugas tidak boleh kosong.');
      return;
    }

    setValidationError('');
    const success = await onAddTodo(trimmedTitle, priority);
    if (success) {
      setTitle('');
      setPriority('medium');
    }
  };

  const currentPriorityObj =
    PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[1];

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-6 transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
          Tambah Tugas Baru
        </h2>
      </div>

      <div className="space-y-4">
        {/* Input Title */}
        <div>
          <label htmlFor="todo-title" className="sr-only">
            Judul Tugas
          </label>
          <div className="relative">
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
              placeholder="Contoh: Menyelesaikan laporan modul 4 PPLG..."
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                validationError
                  ? 'border-rose-400 focus:ring-rose-300 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
          </div>
          {validationError && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
              <span>⚠️</span> {validationError}
            </p>
          )}
        </div>

        {/* Priority & Submit Button Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Priority Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="todo-priority"
              className="text-xs font-medium text-slate-500 whitespace-nowrap"
            >
              Prioritas:
            </label>
            <div className="relative flex-1 sm:flex-none">
              <select
                id="todo-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
                className={`w-full sm:w-auto appearance-none pl-7 pr-8 py-2 text-xs font-semibold rounded-lg border cursor-pointer focus:outline-none focus:ring-2 transition-all ${currentPriorityObj.bgBadge}`}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                    {opt.label} ({opt.desc})
                  </option>
                ))}
              </select>
              {/* Dot indicator inside select */}
              <span
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${currentPriorityObj.dotColor}`}
              />
              {/* Custom caret */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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
    </form>
  );
}

