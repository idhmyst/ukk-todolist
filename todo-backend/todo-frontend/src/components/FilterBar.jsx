import React from 'react';
import { ListFilter, CheckCheck, Clock, Search, ArrowUpDown, Calendar } from 'lucide-react';

export default function FilterBar({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
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
    <div className="space-y-3 mb-5 w-full max-w-full min-w-0">
      {/* Search Input Bar */}
      <div className="relative w-full max-w-full min-w-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari tugas berdasarkan judul..."
          className="w-full max-w-full min-w-0 pl-9 pr-8 py-2 text-xs sm:text-sm font-medium rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 shadow-xs transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
            title="Bersihkan pencarian"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs & Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 w-full max-w-full min-w-0">
        {/* Filter Tabs Container (Flex Wrap - will NEVER overflow) */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs w-full sm:w-auto max-w-full min-w-0">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 min-w-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black flex-shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Sort Selector & Pending Counter */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end min-w-0">
          {/* 2-Way Switch: Urgensi vs Per Hari */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onSortChange('urgency')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                sortBy === 'urgency'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Urgensi</span>
            </button>
            <button
              type="button"
              onClick={() => onSortChange('deadline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                sortBy === 'deadline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Per Hari (Deadline)</span>
            </button>
          </div>

          {/* Counter Info */}
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 max-w-full truncate shadow-2xs">
            {pending === 0 && all > 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                Semua tugas selesai
              </span>
            ) : (
              <span>
                <strong className="text-indigo-700 font-extrabold">{pending}</strong> belum selesai
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
