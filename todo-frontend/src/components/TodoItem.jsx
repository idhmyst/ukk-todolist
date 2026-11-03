import React, { useState } from 'react';
import { Trash2, Calendar, Check, Loader2 } from 'lucide-react';

const PRIORITY_BADGES = {
  low: {
    label: 'Low',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High',
    classes: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
};

function formatIndonesianDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export default function TodoItem({ todo, onToggleStatus, onDelete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const priorityMeta =
    PRIORITY_BADGES[todo.priority?.toLowerCase()] || PRIORITY_BADGES.medium;

  const handleToggle = async () => {
    if (isUpdating || isDeleting) return;
    setIsUpdating(true);
    try {
      await onToggleStatus(todo.id, !todo.is_completed);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(todo.id);
    } catch {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 ${
        todo.is_completed
          ? 'bg-slate-50/70 border-slate-200/60 shadow-none'
          : 'bg-white border-slate-200/90 hover:border-indigo-200 hover:shadow-sm'
      }`}
    >
      {/* Custom Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.is_completed}
        onClick={handleToggle}
        disabled={isUpdating || isDeleting}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
          todo.is_completed
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
            : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/30'
        } disabled:opacity-50`}
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin text-current" />
        ) : todo.is_completed ? (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        ) : null}
      </button>

      {/* Todo Content (Title, Priority & Date) */}
      <div className="flex-1 min-w-0" onClick={handleToggle}>
        <p
          className={`text-sm font-medium leading-relaxed break-words cursor-pointer select-none transition-all ${
            todo.is_completed
              ? 'line-through text-slate-400 decoration-slate-400/80'
              : 'text-slate-800'
          }`}
        >
          {todo.title}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border shadow-2xs ${priorityMeta.classes}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
            <span>{priorityMeta.label}</span>
          </span>

          {/* Creation Date */}
          {todo.created_at && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatIndonesianDate(todo.created_at)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions / Delete Button */}
      <div className="flex-shrink-0 flex items-center">
        {showConfirmDelete ? (
          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1"
            >
              {isDeleting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Hapus'
              )}
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-rose-100/70 rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmDelete(true)}
            disabled={isUpdating || isDeleting}
            title="Hapus tugas"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition-all duration-150 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4 stroke-[1.8]" />
          </button>
        )}
      </div>
    </div>
  );
}

