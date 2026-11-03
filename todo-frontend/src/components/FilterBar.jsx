import React from 'react';
import { ListFilter, CheckCheck, Clock, Search } from 'lucide-react';

export default function FilterBar({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
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
    <div className="space-y-3.5 mb-5">
      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari tugas berdasarkan judul..."
          className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-slate-200/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Tabs & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Filter Tabs */}
        <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
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
        <div className="text-xs font-medium text-slate-500 self-end sm:self-auto">
          {pending === 0 && all > 0 ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              ✨ Semua tugas sudah selesai!
            </span>
          ) : (
            <span>
              <strong className="text-indigo-600 font-bold">{pending}</strong> tugas belum selesai
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
