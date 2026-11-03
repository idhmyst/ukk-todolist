import React from 'react';
import { Search, Bell, ShoppingBag, Plus, Menu, RefreshCw } from 'lucide-react';

export default function TopHeader({
  onToggleSidebar,
  onOpenAddModal,
  searchQuery,
  onSearchChange,
  isBackendOnline,
  isRefreshing,
  onRefresh,
}) {
  return (
    <header className="h-18 px-4 sm:px-8 bg-white border-b border-slate-200/80 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left Title & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Buka Navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Todo List
        </h1>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Backend Status Pill */}
        <div
          title={isBackendOnline ? 'Backend Golang Terhubung' : 'Backend Golang Offline'}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isBackendOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{isBackendOnline ? 'Online (8080)' : 'Offline'}</span>
        </div>

        {/* Sync / Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sinkronkan data dengan backend"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            2
          </span>
        </button>

        {/* Shopping / Task Bag */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors hidden xs:block"
          title="Aktivitas"
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* Primary + Add Task Button */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}

