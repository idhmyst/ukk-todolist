import React from 'react';
import { CheckCircle2, Server, RefreshCw } from 'lucide-react';

export default function Navbar({ isBackendOnline, isRefreshing, onRefresh }) {
  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white ring-4 ring-indigo-50">
            <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Task Manager
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-xs">
                UKK PPLG
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Proyek Aplikasi To-Do List Fullstack • SMK PPLG
            </p>
          </div>
        </div>

        {/* Backend Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-xs transition-colors ${
              isBackendOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isBackendOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBackendOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span className="hidden xs:inline">Backend:</span>
            <span>{isBackendOnline ? 'Online (8080)' : 'Offline'}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Muat ulang data dari server"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-all disabled:opacity-50"
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

