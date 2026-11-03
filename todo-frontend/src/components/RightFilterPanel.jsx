import React from 'react';
import {
  List,
  Edit3,
  Star,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export default function RightFilterPanel({
  activeFilter,
  onFilterChange,
  counts: { all, myTasks, favorites, done, deleted },
}) {
  const menuItems = [
    {
      id: 'all',
      label: 'All',
      icon: List,
      count: all,
      showCount: true,
    },
    {
      id: 'my_tasks',
      label: 'My Task',
      icon: Edit3,
      count: myTasks,
      showCount: false,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Star,
      count: favorites,
      showCount: favorites > 0,
    },
    {
      id: 'done',
      label: 'Done',
      icon: CheckCircle2,
      count: done,
      showCount: true,
    },
    {
      id: 'deleted',
      label: 'Deleted',
      icon: Trash2,
      count: deleted,
      showCount: deleted > 0,
    },
  ];

  return (
    <div className="w-full lg:w-56 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1 sticky top-24">
        {menuItems.map((item) => {
          const isActive = activeFilter === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-indigo-600'
                      : item.id === 'favorites'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.showCount && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

