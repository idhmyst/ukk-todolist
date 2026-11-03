import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const PRIORITY_BADGES = {
  low: {
    label: 'Low',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
    dot: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/90',
    dot: 'bg-amber-500',
  },
  high: {
    label: 'High',
    classes: 'bg-rose-50 text-rose-700 border-rose-200/90',
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
      className={`group relative flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 ${
        todo.is_completed
          ? 'bg-slate-50/70 border-slate-200/60 shadow-none'
          : 'bg-white border-slate-200/90 hover:border-indigo-200 hover:shadow-xs'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.is_completed}
        onClick={handleToggle}
        disabled={isUpdating || isDeleting}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
          todo.is_completed
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
            : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/20'
        } disabled:opacity-50`}
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin text-current" />
        ) : todo.is_completed ? (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        ) : null}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1" onClick={handleToggle}>
        <p
          className={`text-sm font-semibold leading-relaxed break-words cursor-pointer select-none transition-all ${
            todo.is_completed
              ? 'line-through text-slate-400 decoration-slate-400/80'
              : 'text-slate-800'
          }`}
        >
          {todo.title}
        </p>

        {/* Badges & Meta Info */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border shadow-2xs ${priorityMeta.classes}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityMeta.dot}`} />
            <span>{priorityMeta.label}</span>
          </span>

          {/* Due Date (Deadline) Badge */}
          {todo.due_date && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Calendar className="w-3 h-3" />
              <span>Deadline: {formatIndonesianDate(todo.due_date)}</span>
            </span>
          )}

          {/* Creation Date */}
          {todo.created_at && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 ml-0.5">
              <Clock className="w-3 h-3" />
              <span>{formatIndonesianDate(todo.created_at)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions (Edit & Delete) */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {showConfirmDelete ? (
          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1"
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Hapus'}
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-rose-100/60 rounded-lg transition-colors"
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
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40"
            >
              <Edit3 className="w-4 h-4 stroke-[1.8]" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              disabled={isUpdating || isDeleting}
              title="Hapus tugas"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4 stroke-[1.8]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
