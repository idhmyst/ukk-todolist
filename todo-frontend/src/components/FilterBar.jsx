import React from 'react';
import { ListFilter, CheckCheck, Clock } from 'lucide-react';

export default function FilterBar({
  activeFilter,
  onFilterChange,
  counts: { all, pending, completed },
}) {
  const tabs = [
    {
      id: 'all',
      label: 'Semua',
      count: all,
      icon: ListFilter,
    },
    {
      id: 'pending',
      label: 'Belum Selesai',
      count: pending,
      icon: Clock,
    },
    {
      id: 'completed',
      label: 'Selesai',
      count: completed,
      icon: CheckCheck,
    },
  ];

  return (
    <div className="space-y-3 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Filter Tabs */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-xs">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Counter Info */}
        <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 self-end sm:self-auto">
          {pending === 0 && all > 0 ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              ✨ Semua tugas selesai!
            </span>
          ) : (
            <span>
              <strong className="text-indigo-600 font-semibold">{pending}</strong> tugas tersisa
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

