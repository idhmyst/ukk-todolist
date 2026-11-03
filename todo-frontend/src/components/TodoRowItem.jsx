import React, { useState } from 'react';
import {
  GripVertical,
  Star,
  Check,
  MoreHorizontal,
  Edit3,
  Trash2,
  Calendar,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_COLORS = {
  Social: 'bg-rose-500 text-white',
  'Theme Support': 'bg-amber-500 text-white',
  Friends: 'bg-sky-500 text-white',
  Freelance: 'bg-emerald-500 text-white',
  Coding: 'bg-purple-600 text-white',
  UKK: 'bg-indigo-600 text-white',
};

const PRIORITY_BADGES = {
  high: { label: 'High', color: 'bg-rose-500 text-white' },
  medium: { label: 'Medium', color: 'bg-amber-500 text-white' },
  low: { label: 'Low', color: 'bg-emerald-500 text-white' },
};

// Preset avatar dummy untuk kolaborator / penanggung jawab tugas
const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80',
];

export default function TodoRowItem({
  todo,
  isSelected,
  onSelectToggle,
  onToggleStatus,
  onToggleFavorite,
  onEdit,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const priorityKey = (todo.priority || 'medium').toLowerCase();
  const priorityInfo = PRIORITY_BADGES[priorityKey] || PRIORITY_BADGES.medium;

  // Kategori default jika belum diset
  const categoryName = todo.category || (priorityKey === 'high' ? 'Coding' : priorityKey === 'low' ? 'Freelance' : 'Theme Support');
  const categoryBadgeClass = CATEGORY_COLORS[categoryName] || 'bg-indigo-600 text-white';

  const handleToggle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onToggleStatus(todo.id, !todo.is_completed);
    } finally {
      setIsUpdating(false);
    }
  };

  // Border highlight seperti pada gambar referensi
  const borderHighlight = todo.is_completed
    ? 'border-indigo-400/90 shadow-indigo-500/5'
    : priorityKey === 'high'
    ? 'border-emerald-400/90 shadow-emerald-500/5'
    : 'border-slate-200/90 hover:border-indigo-300';

  return (
    <div
      className={`group relative flex items-center gap-3 sm:gap-4 px-4 py-3 sm:py-3.5 bg-white rounded-2xl border transition-all duration-150 ${borderHighlight} ${
        todo.is_completed ? 'bg-slate-50/50' : 'hover:shadow-xs'
      }`}
    >
      {/* 1. Drag Handle Dots */}
      <div className="cursor-grab text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* 2. Custom Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.is_completed}
        onClick={handleToggle}
        disabled={isUpdating}
        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
          todo.is_completed
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
            : 'border-slate-300 bg-white hover:border-indigo-500'
        }`}
      >
        {isUpdating ? (
          <Loader2 className="w-3 h-3 animate-spin text-current" />
        ) : todo.is_completed ? (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        ) : null}
      </button>

      {/* 3. Star ⭐ (Favorites) Icon */}
      <button
        type="button"
        onClick={() => onToggleFavorite(todo.id)}
        className="p-1 text-slate-300 hover:text-amber-400 transition-colors flex-shrink-0"
        title={todo.is_favorite ? 'Hapus dari Favorit' : 'Tandai Favorit'}
      >
        <Star
          className={`w-4 h-4 transition-transform active:scale-125 ${
            todo.is_favorite
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-300 hover:text-amber-400'
          }`}
        />
      </button>

      {/* 4. Task Title & Date */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <p
            onClick={handleToggle}
            className={`text-xs sm:text-sm font-semibold truncate cursor-pointer transition-all ${
              todo.is_completed
                ? 'line-through text-slate-400 decoration-slate-400'
                : 'text-slate-800 hover:text-indigo-600'
            }`}
          >
            {todo.title}
          </p>
        </div>
      </div>

      {/* 5. Category Pill Badge (Vibrant colors as in screenshot) */}
      <div className="flex-shrink-0 hidden xs:block">
        <span
          className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide shadow-2xs ${categoryBadgeClass}`}
        >
          {categoryName}
        </span>
      </div>

      {/* 6. Assignee Avatars Stack */}
      <div className="flex-shrink-0 hidden sm:flex items-center -space-x-2 overflow-hidden">
        {DEFAULT_AVATARS.slice(0, (todo.id % 3) + 2).map((avatarUrl, idx) => (
          <img
            key={idx}
            src={avatarUrl}
            alt="Assignee"
            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
          />
        ))}
      </div>

      {/* 7. Action Menu (Three dots `...`) */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Menu Aksi"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleToggle();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>{todo.is_completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleFavorite(todo.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    todo.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{todo.is_favorite ? 'Hapus Favorit' : 'Jadikan Favorit'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onEdit(todo);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Tugas</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  onDelete(todo.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Hapus Tugas</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

