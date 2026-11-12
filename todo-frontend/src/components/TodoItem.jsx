import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Loader2,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { getDeadlineInfo, formatIndonesianDate } from '../utils/todoHelpers';

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
  const deadlineInfo = todo.due_date ? getDeadlineInfo(todo.due_date) : null;

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

  // Card appearance based on priority and urgency
  let cardStyles = 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm';
  if (todo.is_completed) {
    cardStyles = 'bg-slate-50/80 border-slate-200/80 border-l-4 border-l-slate-300 shadow-none opacity-60';
  } else if (priorityKey === 'high') {
    if (deadlineInfo?.isOverdue) {
      cardStyles = 'bg-rose-50/25 border-rose-200 border-l-4 border-l-rose-600 hover:border-rose-400 shadow-xs';
    } else if (deadlineInfo?.isToday) {
      cardStyles = 'bg-amber-50/25 border-amber-200 border-l-4 border-l-amber-500 hover:border-amber-400 shadow-xs';
    } else {
      cardStyles = 'bg-white border-slate-200 border-l-4 border-l-rose-500 hover:border-rose-300 hover:shadow-sm';
    }
  } else if (priorityKey === 'low') {
    cardStyles = 'bg-white border-slate-200 border-l-4 border-l-emerald-500 hover:border-emerald-300 hover:shadow-sm';
  } else {
    // medium
    cardStyles = 'bg-white border-slate-200 border-l-4 border-l-amber-400 hover:border-amber-300 hover:shadow-sm';
  }

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 w-full max-w-full min-w-0 ${cardStyles}`}
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

            {/* Smart Due Date (Deadline) Badge with Urgency Indicators */}
            {todo.due_date && (
              <>
                {todo.is_completed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 max-w-full">
                    <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">Deadline: {deadlineInfo?.formattedDate || formatIndonesianDate(todo.due_date)}</span>
                  </span>
                ) : deadlineInfo?.isOverdue ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs animate-pulse max-w-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span className="truncate">Terlewat ({Math.abs(deadlineInfo.diffDays)} hari) • {deadlineInfo.formattedDate}</span>
                  </span>
                ) : deadlineInfo?.isToday ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-900 border border-amber-400 shadow-2xs animate-pulse ring-1 ring-amber-300 max-w-full">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="truncate">Hari Ini • {deadlineInfo.formattedDate}</span>
                  </span>
                ) : deadlineInfo?.isTomorrow ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 max-w-full">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="truncate">Besok • {deadlineInfo.formattedDate}</span>
                  </span>
                ) : deadlineInfo?.isApproaching ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 max-w-full">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span className="truncate">{deadlineInfo.diffDays} hari lagi ({deadlineInfo.formattedDate})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 max-w-full">
                    <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="truncate">Deadline: {deadlineInfo?.formattedDate || formatIndonesianDate(todo.due_date)}</span>
                  </span>
                )}
              </>
            )}

            {/* Reminder Setting Badge */}
            {todo.due_date && todo.reminder && todo.reminder !== 'none' && !todo.is_completed && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200"
                title={`Pengingat deadline berbunyi ${
                  todo.reminder === '1h'
                    ? '1 jam sebelumnya'
                    : todo.reminder === '30m'
                    ? '30 menit sebelumnya'
                    : '5 menit sebelumnya'
                }`}
              >
                <Bell className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                <span>
                  {todo.reminder === '1h'
                    ? 'Notif: 1 Jam'
                    : todo.reminder === '30m'
                    ? 'Notif: 30 Mnt'
                    : 'Notif: 5 Mnt'}
                </span>
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
              onClick={() => onEdit(todo)}
              disabled={isUpdating || isDeleting}
              className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 border border-indigo-200"
              title="Edit tugas"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Edit</span>
            </button>

            {/* Delete Trigger Button */}
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={isUpdating || isDeleting}
              className="px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 border border-rose-200"
              title="Hapus tugas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Hapus</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
