import React from 'react';
import { AlertTriangle, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

export default function ErrorAlert({ message, onRetry, isRetrying }) {
  return (
    <div className="mb-6 p-4 sm:p-5 bg-rose-50/90 border border-rose-200/90 rounded-2xl shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 mt-0.5">
          <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-rose-900 tracking-tight">
            Koneksi ke Backend Terputus
          </h3>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
            {message || 'Tidak dapat terhubung ke REST API Golang di http://localhost:8080.'}
          </p>

          <div className="mt-3 p-3 bg-white/80 rounded-xl border border-rose-200/70 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Petunjuk Menjalankan Backend:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 font-mono text-[11px]">
              <li>Buka terminal baru di folder <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-semibold">todo-backend</code></li>
              <li>Pastikan MySQL berjalan (XAMPP / Laragon / Docker)</li>
              <li>Jalankan perintah: <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">go run main.go</code></li>
            </ol>
          </div>

          <div className="mt-3.5 flex items-center gap-3">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Mencoba Terhubung...' : 'Coba Lagi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

