import React, { useState } from 'react';
import {
  Square,
  CheckSquare,
  MinusSquare,
  ChevronDown,
  ArrowUpDown,
  Search,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export default function TodoToolbar({
  selectedIds,
  totalItems,
  onSelectAll,
  onDeselectAll,
  onBulkComplete,
  onBulkDelete,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}) {
  const [showSelectMenu, setShowSelectMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const isAllSelected = totalItems > 0 && selectedIds.length === totalItems;
  const isPartialSelected = selectedIds.length > 0 && selectedIds.length < totalItems;

  const sortOptions = [
    { value: 'newest', label: 'Terbaru (Newest)' },
    { value: 'oldest', label: 'Terlama (Oldest)' },
    { value: 'priority', label: 'Prioritas (High → Low)' },
    { value: 'alphabetical', label: 'Judul (A - Z)' },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || 'Order by';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      {/* Left Toolbar Controls (Select All & Order By) */}
      <div className="flex items-center gap-2">
        {/* Bulk Select Control */}
        <div className="relative">
          <div className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white shadow-2xs">
            <button
              type="button"
              onClick={isAllSelected ? onDeselectAll : onSelectAll}
              disabled={totalItems === 0}
              className="p-2 sm:px-3 text-slate-600 hover:text-indigo-600 transition-colors disabled:opacity-40"
              title={isAllSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : isPartialSelected ? (
                <MinusSquare className="w-4 h-4 text-indigo-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowSelectMenu(!showSelectMenu)}
              disabled={totalItems === 0}
              className="p-2 pr-2.5 border-l border-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Select Dropdown */}
          {showSelectMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSelectMenu(false)}
              />
              <div className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onSelectAll();
                    setShowSelectMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Pilih Semua ({totalItems})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeselectAll();
                    setShowSelectMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Batal Pilih
                </button>
              </div>
            </>
          )}
        </div>

        {/* Order By Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Order by:</span>
            <span>{currentSortLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 text-xs">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 font-medium transition-colors ${
                      sortBy === opt.value
                        ? 'text-indigo-600 bg-indigo-50/50 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bulk Action Pills (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={onBulkComplete}
              title="Tandai Selesai"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai ({selectedIds.length})</span>
            </button>
            <button
              onClick={onBulkDelete}
              title="Hapus Terpilih"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Search Input Box */}
      <div className="relative flex-1 sm:max-w-xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search todo list..."
          className="w-full pl-3.5 pr-9 py-2 text-xs rounded-xl bg-white border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition-all"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

