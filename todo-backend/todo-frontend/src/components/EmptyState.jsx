import React from 'react';
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react';

export default function EmptyState({ filter }) {
  const meta = {
    all: {
      icon: ClipboardList,
      title: 'Belum Ada Tugas',
      desc: 'Daftar tugasmu masih kosong. Tuliskan tugas baru di formulir atas untuk memulai hari yang produktif!',
      bg: 'bg-indigo-50 text-indigo-600',
    },
    pending: {
      icon: CheckCircle2,
      title: 'Semua Tugas Sudah Selesai!',
      desc: 'Luar biasa! Tidak ada tugas yang masih berstatus pending saat ini.',
      bg: 'bg-emerald-50 text-emerald-600',
    },
    completed: {
      icon: Clock,
      title: 'Belum Ada Tugas Selesai',
      desc: 'Selesaikan beberapa tugas pending dengan mencentang kotak di samping tugas.',
      bg: 'bg-amber-50 text-amber-600',
    },
  }[filter] || {
    icon: ClipboardList,
    title: 'Tidak Ada Tugas',
    desc: 'Tidak ada tugas yang sesuai dengan kriteria penyaringan.',
    bg: 'bg-slate-50 text-slate-500',
  };

  const Icon = meta.icon;

  return (
    <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 backdrop-blur-xs">
      <div
        className={`w-14 h-14 mx-auto mb-3.5 rounded-2xl flex items-center justify-center ${meta.bg}`}
      >
        <Icon className="w-7 h-7 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">
        {meta.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
        {meta.desc}
      </p>
    </div>
  );
}

