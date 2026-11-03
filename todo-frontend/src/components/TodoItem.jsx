import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Loader2,
} from 'lucide-react';

const PRIORITY_BADGES = {
  low: {
    label: 'Low',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    dot: 'bg-emerald-600 ring-1 ring-emerald-200',
  },
  medium: {
    label: 'Medium',
    classes: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    dot: 'bg-amber-500 ring-1 ring-amber-200',
  },
  high: {
    label: 'High',
    classes: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    dot: 'bg-rose-600 ring-1 ring-rose-200 animate-pulse',
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
    }).format(date);
  } catch {
    return dateString;
  }
}

export default function TodoItem({
  todo,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const priorityKey = (todo.priority || 'medium').toLowerCase();
  const priorityMeta = PRIORITY_BADGES[priorityKey] || PRIORITY_BADGES.medium;

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
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 w-full max-w-full min-w-0 ${
        todo.is_completed
          ? 'bg-slate-50/80 border-slate-200/80 shadow-none'
          : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm'
      }`}
    >
      {/* Left side: Checkbox + Title + Badges */}
      <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.is_completed}
          onClick={handleToggle}
          disabled={isUpdating || isDeleting}
          className={`mt-0.5 flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all ${
            todo.is_completed
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-100'
              : 'border-slate-300 bg-slate-50 hover:border-indigo-600 hover:bg-indigo-50/50'
          } disabled:opacity-50`}
        >
          {isUpdating ? (
            <Loader2 className="w-3 h-3 animate-spin text-current" />
          ) : todo.is_completed ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : null}
        </button>

        {/* Content (Title & Badges) */}
        <div className="flex-1 min-w-0" onClick={handleToggle}>
          <p
            className={`text-xs sm:text-base font-bold leading-snug break-words cursor-pointer select-none transition-all ${
              todo.is_completed
                ? 'line-through text-slate-400 decoration-slate-400 decoration-2'
                : 'text-slate-900 hover:text-indigo-600'
            }`}
          >
            {todo.title}
          </p>

          {/* Badges Container */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 w-full min-w-0">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs border ${priorityMeta.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
              <span>{priorityMeta.label}</span>
            </span>

            {/* Due Date (Deadline) Badge */}
            {todo.due_date && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 max-w-full">
                <Calendar className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                <span className="truncate">Deadline: {formatIndonesianDate(todo.due_date)}</span>
              </span>
            )}

            {/* Creation Date */}
            {todo.created_at && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{formatIndonesianDate(todo.created_at)}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto flex-shrink-0">
        {showConfirmDelete ? (
          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-300">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Hapus'}
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-rose-100 rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
        ) : (
          <>
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(todo)}
              disabled={isUpdating || isDeleting}
              title="Edit tugas"
              className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 rounded-xl transition-all shadow-2xs hover:shadow-xs disabled:opacity-40"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Edit</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              disabled={isUpdating || isDeleting}
              title="Hapus tugas"
              className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-xl transition-all shadow-2xs hover:shadow-xs disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Hapus</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
