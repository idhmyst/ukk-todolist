import React, { useMemo } from 'react';
import { BarChart3, Filter } from 'lucide-react';

export default function AnalyticsView({
  todos = [],
  onSelectPriorityFilter,
}) {
  const data = useMemo(() => {
    const total = todos.length;
    const highTodos = todos.filter((t) => (t.priority || '').toLowerCase() === 'high');
    const medTodos = todos.filter((t) => (t.priority || '').toLowerCase() === 'medium');
    const lowTodos = todos.filter((t) => (t.priority || '').toLowerCase() === 'low');

    const highCompleted = highTodos.filter((t) => t.is_completed).length;
    const medCompleted = medTodos.filter((t) => t.is_completed).length;
    const lowCompleted = lowTodos.filter((t) => t.is_completed).length;

    const highPending = highTodos.length - highCompleted;
    const medPending = medTodos.length - medCompleted;
    const lowPending = lowTodos.length - lowCompleted;

    const highPct = total > 0 ? Math.round((highTodos.length / total) * 100) : 0;
    const medPct = total > 0 ? Math.round((medTodos.length / total) * 100) : 0;
    const lowPct = total > 0 ? Math.round((lowTodos.length / total) * 100) : 0;

    const maxCount = Math.max(highTodos.length, medTodos.length, lowTodos.length, 1);

    return {
      total,
      maxCount,
      items: [
        {
          key: 'high',
          name: 'Tinggi',
          code: 'High',
          total: highTodos.length,
          pending: highPending,
          completed: highCompleted,
          pct: highPct,
          barColor: 'bg-rose-500',
          trackColor: 'bg-rose-100',
          textColor: 'text-rose-700',
          dotColor: 'bg-rose-500',
          borderHover: 'hover:border-rose-300',
        },
        {
          key: 'medium',
          name: 'Sedang',
          code: 'Medium',
          total: medTodos.length,
          pending: medPending,
          completed: medCompleted,
          pct: medPct,
          barColor: 'bg-amber-500',
          trackColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          dotColor: 'bg-amber-500',
          borderHover: 'hover:border-amber-300',
        },
        {
          key: 'low',
          name: 'Rendah',
          code: 'Low',
          total: lowTodos.length,
          pending: lowPending,
          completed: lowCompleted,
          pct: lowPct,
          barColor: 'bg-emerald-500',
          trackColor: 'bg-emerald-100',
          textColor: 'text-emerald-700',
          dotColor: 'bg-emerald-500',
          borderHover: 'hover:border-emerald-300',
        },
      ],
    };
  }, [todos]);

  if (data.total === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-700">Belum Ada Data Tugas</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Tambahkan tugas baru untuk melihat grafik perbandingan prioritas High, Medium, dan Low.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Sederhana & Jelas */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-slate-900">
          Grafik Kebutuhan Prioritas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Perbandingan distribusi tugas berdasarkan tingkat prioritas tinggi, sedang, dan rendah.
        </p>
      </div>

      {/* Baris Proporsi Horizontal Gabungan (Segmented Bar) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span>Proporsi Keseluruhan ({data.total} tugas)</span>
          <span className="text-slate-400">100%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          {data.items.map((item) =>
            item.pct > 0 ? (
              <div
                key={item.key}
                style={{ width: `${item.pct}%` }}
                className={`${item.barColor} transition-all duration-300`}
                title={`${item.name} (${item.code}): ${item.total} tugas (${item.pct}%)`}
              />
            ) : null
          )}
        </div>
      </div>

      {/* Grafik Kolom Vertikal (Bar Chart) */}
      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
        <div className="text-xs font-semibold text-slate-700 mb-6">
          Jumlah Tugas per Tingkat Prioritas
        </div>

        <div className="grid grid-cols-3 gap-4 items-end h-48 pb-2 border-b border-slate-200">
          {data.items.map((item) => {
            const heightPercent =
              data.maxCount > 0 ? Math.max(Math.round((item.total / data.maxCount) * 100), item.total > 0 ? 12 : 4) : 4;

            return (
              <div key={item.key} className="flex flex-col items-center h-full justify-end group">
                <span className="text-xs font-bold text-slate-700 mb-1.5 transition-transform group-hover:-translate-y-0.5">
                  {item.total}
                </span>

                <div className="w-full max-w-[56px] bg-slate-200/60 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full ${item.barColor} rounded-t-lg transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Label Bawah Kolom */}
        <div className="grid grid-cols-3 gap-4 pt-3 text-center">
          {data.items.map((item) => (
            <div key={item.key}>
              <div className="text-xs font-bold text-slate-800">
                {item.name}
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {item.code} ({item.pct}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rincian Status: Selesai vs Belum Selesai */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Rincian Status Pengerjaan
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.items.map((item) => (
            <div
              key={item.key}
              className={`p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs transition-all ${item.borderHover}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                  <span className="text-xs font-bold text-slate-900">
                    {item.name} ({item.code})
                  </span>
                </div>
                <span className={`text-xs font-bold ${item.textColor}`}>
                  {item.total}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Belum selesai:</span>
                  <span className="font-semibold text-slate-800">{item.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Selesai:</span>
                  <span className="font-semibold text-emerald-600">{item.completed}</span>
                </div>
              </div>

              {item.total > 0 && onSelectPriorityFilter && (
                <button
                  type="button"
                  onClick={() => onSelectPriorityFilter(item.key)}
                  className="mt-3 w-full py-1.5 px-2 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>Lihat di Daftar Tugas</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
