import React from 'react';
import { CheckCircle2, RefreshCw, LayoutTemplate } from 'lucide-react';

export default function Navbar({
  isRefreshing,
  onRefresh,
  onToggleWidgetMode,
}) {
  return (
    <header className="mb-7 pb-6 border-b border-slate-100">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white ring-4 ring-indigo-50 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center">
              Kelarin<span className="text-indigo-600">.</span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Widget Desktop Button */}
          <button
            type="button"
            onClick={onToggleWidgetMode}
            title="Buka tampilan Widget Desktop (Notch Island)"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded-xl border border-zinc-200 transition-all cursor-pointer shadow-xs group"
          >
            <LayoutTemplate className="w-4 h-4 text-indigo-600 group-hover:text-indigo-400" />
            <span className="hidden sm:inline">Widget Desktop</span>
          </button>

          {/* Sync / Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Muat ulang data dari server"
            className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
