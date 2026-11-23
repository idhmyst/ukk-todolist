import React, { useState, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Target,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Zap,
} from 'lucide-react';
import { getDeadlineInfo } from '../utils/todoHelpers';

export default function AnalyticsView({
  todos = [],
  onSelectPriorityFilter,
  onConsultAi,
}) {
  const [activeSlice, setActiveSlice] = useState(null); // 'high' | 'medium' | 'low' | null

  // 1. Kalkulasi Metrik Distribusi & Beban Kerja
  const analytics = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.is_completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Breakdown Prioritas
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

    const highCompRate = highTodos.length > 0 ? Math.round((highCompleted / highTodos.length) * 100) : 0;
    const medCompRate = medTodos.length > 0 ? Math.round((medCompleted / medTodos.length) * 100) : 0;
    const lowCompRate = lowTodos.length > 0 ? Math.round((lowCompleted / lowTodos.length) * 100) : 0;

    // Workload Score (Indeks Beban Kerja: bobot High=3, Medium=2, Low=1 pada tugas pending)
    const pendingWeighted = highPending * 3 + medPending * 2 + lowPending * 1;
    const maxPossibleWeight = Math.max(total * 3, 1);
    const workloadScore = Math.min(Math.round((pendingWeighted / maxPossibleWeight) * 100), 100);

    let workloadLevel = {
      label: 'Beban Ringan & Terkendali',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Distribusi tugas sangat teratur. Prioritas tinggi terkendali dengan baik.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
    };

    if (highPending >= 3 || workloadScore > 65) {
      workloadLevel = {
        label: 'Beban Kritis (High Density)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        description: 'Terdapat akumulasi tugas berprioritas tinggi yang belum selesai. Segera eksekusi tugas High terlebih dahulu!',
        icon: Flame,
        color: 'text-rose-600',
      };
    } else if (workloadScore >= 35) {
      workloadLevel = {
        label: 'Beban Produktif & Seimbang',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Beban kerja normal dan seimbang antara prioritas sedang dan tinggi.',
        icon: Activity,
        color: 'text-amber-600',
      };
    }

    // Analisis Matriks Eisenhower (Urgent vs Important)
    const now = Date.now();
    const urgentThresholdMs = 24 * 60 * 60 * 1000; // < 24 jam

    const matrix = {
      doFirst: [], // High + Urgent
      schedule: [], // High + Not Urgent
      quickWins: [], // Medium/Low + Urgent
      routine: [], // Medium/Low + Not Urgent
    };

    todos.forEach((t) => {
      if (t.is_completed) return; // Hanya analisa tugas aktif

      const isHigh = (t.priority || '').toLowerCase() === 'high';
      let isUrgent = false;

      if (t.due_date) {
        const dInfo = getDeadlineInfo(t.due_date);
        if (dInfo && dInfo.targetDate) {
          const diffMs = dInfo.targetDate.getTime() - now;
          if (diffMs <= urgentThresholdMs) {
            isUrgent = true;
          }
        }
      }

      if (isHigh && isUrgent) {
        matrix.doFirst.push(t);
      } else if (isHigh && !isUrgent) {
        matrix.schedule.push(t);
      } else if (!isHigh && isUrgent) {
        matrix.quickWins.push(t);
      } else {
        matrix.routine.push(t);
      }
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      high: {
        total: highTodos.length,
        completed: highCompleted,
        pending: highPending,
        pct: highPct,
        compRate: highCompRate,
      },
      medium: {
        total: medTodos.length,
        completed: medCompleted,
        pending: medPending,
        pct: medPct,
        compRate: medCompRate,
      },
      low: {
        total: lowTodos.length,
        completed: lowCompleted,
        pending: lowPending,
        pct: lowPct,
        compRate: lowCompRate,
      },
      workloadScore,
      workloadLevel,
      matrix,
    };
  }, [todos]);

  // 2. SVG Donut Geometry Calculations
  // Radius = 62, Circumference ≈ 389.55
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = useMemo(() => {
    if (analytics.total === 0) return [];

    const highFrac = analytics.high.total / analytics.total;
    const medFrac = analytics.medium.total / analytics.total;
    const lowFrac = analytics.low.total / analytics.total;

    const highStroke = highFrac * circumference;
    const medStroke = medFrac * circumference;
    const lowStroke = lowFrac * circumference;

    // Offsets
    // Segment 1 (High): offset 0
    const highOffset = 0;
    // Segment 2 (Medium): offset starts after high
    const medOffset = -(highStroke);
    // Segment 3 (Low): offset starts after high + med
    const lowOffset = -(highStroke + medStroke);

    return [
      {
        id: 'high',
        label: 'Tinggi (High)',
        color: '#F43F5E', // Rose 500
        hoverColor: '#E11D48',
        strokeDasharray: `${highStroke} ${circumference - highStroke}`,
        strokeDashoffset: highOffset,
        count: analytics.high.total,
        pct: analytics.high.pct,
        pending: analytics.high.pending,
        completed: analytics.high.completed,
      },
      {
        id: 'medium',
        label: 'Sedang (Medium)',
        color: '#F59E0B', // Amber 500
        hoverColor: '#D97706',
        strokeDasharray: `${medStroke} ${circumference - medStroke}`,
        strokeDashoffset: medOffset,
        count: analytics.medium.total,
        pct: analytics.medium.pct,
        pending: analytics.medium.pending,
        completed: analytics.medium.completed,
      },
      {
        id: 'low',
        label: 'Rendah (Low)',
        color: '#10B981', // Emerald 500
        hoverColor: '#059669',
        strokeDasharray: `${lowStroke} ${circumference - lowStroke}`,
        strokeDashoffset: lowOffset,
        count: analytics.low.total,
        pct: analytics.low.pct,
        pending: analytics.low.pending,
        completed: analytics.low.completed,
      },
    ];
  }, [analytics, circumference]);

  const activeSegmentData = useMemo(() => {
    if (!activeSlice) return null;
    return donutSegments.find((s) => s.id === activeSlice);
  }, [activeSlice, donutSegments]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full min-w-0">
      {/* Header Banner Analisis */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white border border-indigo-900/40 shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <PieChart className="w-3.5 h-3.5" />
              <span>Priority Intelligence Hub</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Distribusi Kebutuhan & Beban Prioritas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Analisis visual proporsi tugas <strong>Tinggi (High)</strong>, <strong>Sedang (Medium)</strong>, dan <strong>Rendah (Low)</strong> untuk mengoptimalkan fokus kerja harian Anda.
            </p>
          </div>

          {/* Quick AI Strategy Button */}
          <button
            type="button"
            onClick={onConsultAi}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/30 border border-white/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex-shrink-0"
            title="Minta strategi prioritas dari AI"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Minta Saran AI</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu KPI Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Tugas */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tugas</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.total}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {analytics.pending} aktif • {analytics.completed} selesai
          </p>
        </div>

        {/* KPI 2: Completion Rate */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penyelesaian</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{analytics.completionRate}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics.completionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 3: High Priority Ratio */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proporsi High</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{analytics.high.pct}%</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {analytics.high.total} tugas prioritas tinggi
          </p>
        </div>

        {/* KPI 4: Workload Health Index */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indeks Beban</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{analytics.workloadScore}%</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
            {analytics.workloadLevel.label}
          </p>
        </div>
      </div>

      {/* DUAL SECTION: Interactive Donut Chart & Stacked Bar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* SEKSI 1: Interactive SVG Donut Chart (5 Kolom) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Proporsi Prioritas
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Interaktif</span>
            </div>

            {/* SVG Donut Graphic */}
            <div className="relative flex items-center justify-center my-4 py-2">
              <svg className="w-48 h-48 sm:w-52 sm:h-52 -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="20"
                />

                {/* Donut Segments */}
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.id}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={segment.id === activeSlice ? segment.hoverColor : segment.color}
                    strokeWidth={segment.id === activeSlice ? '24' : '20'}
                    strokeDasharray={segment.strokeDasharray}
                    strokeDashoffset={segment.strokeDashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setActiveSlice(segment.id)}
                    onMouseLeave={() => setActiveSlice(null)}
                    onClick={() => onSelectPriorityFilter(segment.id)}
                  />
                ))}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {activeSegmentData ? (
                  <div className="animate-in zoom-in-90 duration-150">
                    <span
                      className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: activeSegmentData.color }}
                    >
                      {activeSegmentData.id}
                    </span>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {activeSegmentData.count}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {activeSegmentData.pct}% Tugas
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </span>
                    <div className="text-3xl font-black text-slate-900">
                      {analytics.total}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Tugas Tercatat
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            {donutSegments.map((seg) => {
              const isHovered = activeSlice === seg.id;
              return (
                <div
                  key={seg.id}
                  onMouseEnter={() => setActiveSlice(seg.id)}
                  onMouseLeave={() => setActiveSlice(null)}
                  onClick={() => onSelectPriorityFilter(seg.id)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered ? 'bg-slate-100 scale-[1.01]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs font-bold text-slate-800">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900">{seg.count} tugas</span>
                    <span className="text-xs font-black text-slate-500 w-10 text-right">
                      {seg.pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEKSI 2: Priority Workload & Progress Breakdown (7 Kolom) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Progress Pengerjaan Per Prioritas
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-600">Selesai vs Pending</span>
            </div>

            {/* List 3 Bar Chart Cards */}
            <div className="space-y-4">
              {/* Card 1: High Priority */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      H
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Prioritas Tinggi (High)</h4>
                      <p className="text-[11px] text-slate-500">
                        {analytics.high.pending} pending • {analytics.high.completed} selesai
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPriorityFilter('high')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-100/60 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  >
                    <span>Filter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-rose-700">Tingkat Selesai</span>
                    <span className="text-slate-800">{analytics.high.compRate}%</span>
                  </div>
                  <div className="w-full bg-rose-200/60 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${analytics.high.compRate}%` }}
                      title={`Selesai: ${analytics.high.completed} tugas`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-500"
                      style={{ width: `${100 - analytics.high.compRate}%` }}
                      title={`Belum Selesai: ${analytics.high.pending} tugas`}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Medium Priority */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      M
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Prioritas Sedang (Medium)</h4>
                      <p className="text-[11px] text-slate-500">
                        {analytics.medium.pending} pending • {analytics.medium.completed} selesai
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPriorityFilter('medium')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-white hover:bg-amber-100/60 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                  >
                    <span>Filter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-amber-800">Tingkat Selesai</span>
                    <span className="text-slate-800">{analytics.medium.compRate}%</span>
                  </div>
                  <div className="w-full bg-amber-200/60 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${analytics.medium.compRate}%` }}
                      title={`Selesai: ${analytics.medium.completed} tugas`}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${100 - analytics.medium.compRate}%` }}
                      title={`Belum Selesai: ${analytics.medium.pending} tugas`}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Low Priority */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      L
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Prioritas Rendah (Low)</h4>
                      <p className="text-[11px] text-slate-500">
                        {analytics.low.pending} pending • {analytics.low.completed} selesai
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPriorityFilter('low')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-100/60 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <span>Filter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-emerald-800">Tingkat Selesai</span>
                    <span className="text-slate-800">{analytics.low.compRate}%</span>
                  </div>
                  <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${analytics.low.compRate}%` }}
                      title={`Selesai: ${analytics.low.completed} tugas`}
                    />
                    <div
                      className="bg-emerald-300 h-full transition-all duration-500"
                      style={{ width: `${100 - analytics.low.compRate}%` }}
                      title={`Belum Selesai: ${analytics.low.pending} tugas`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Workload Recommendation Footnote */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
            <analytics.workloadLevel.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${analytics.workloadLevel.color}`} />
            <div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${analytics.workloadLevel.badgeClass}`}>
                {analytics.workloadLevel.label}
              </span>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                {analytics.workloadLevel.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEKSI 3: KREATIF & INOVATIF — Eisenhower Priority & Urgency Matrix */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Matriks Kuadran Eisenhower (Urgensi vs Kepentingan)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Kombinasi cerdas antara <strong>Tenggat Waktu</strong> dan <strong>Tingkat Prioritas</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kuadran 1: DO FIRST (High + Deadline < 24 jam) */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border-2 border-rose-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">
                    Kuadran 1: Segera Kerjakan (Do First)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-800">
                  {analytics.matrix.doFirst.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-rose-700 mb-3">
                Prioritas Tinggi & batas waktu mendesak (kurang dari 24 jam).
              </p>

              {/* Task Preview */}
              <div className="space-y-1.5">
                {analytics.matrix.doFirst.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Tidak ada tugas kritis saat ini 🎉</p>
                ) : (
                  analytics.matrix.doFirst.slice(0, 3).map((t) => (
                    <div key={t.id} className="text-xs font-semibold text-slate-800 bg-white/90 p-2 rounded-xl border border-rose-100 truncate shadow-2xs">
                      • {t.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Kuadran 2: SCHEDULE (High + Deadline > 24 jam) */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                    Kuadran 2: Jadwalkan (Schedule)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-200 text-indigo-800">
                  {analytics.matrix.schedule.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-indigo-700 mb-3">
                Prioritas Tinggi, namun waktu masih aman (&gt; 24 jam).
              </p>

              {/* Task Preview */}
              <div className="space-y-1.5">
                {analytics.matrix.schedule.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Tidak ada tugas terjadwal</p>
                ) : (
                  analytics.matrix.schedule.slice(0, 3).map((t) => (
                    <div key={t.id} className="text-xs font-semibold text-slate-800 bg-white/90 p-2 rounded-xl border border-indigo-100 truncate shadow-2xs">
                      • {t.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Kuadran 3: QUICK WINS (Medium/Low + Deadline < 24 jam) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                    Kuadran 3: Quick Wins (Selesaikan Cepat)
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-800">
                  {analytics.matrix.quickWins.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mb-3">
                Prioritas Sedang/Rendah namun mendekati tenggat.
              </p>

              {/* Task Preview */}
              <div className="space-y-1.5">
                {analytics.matrix.quickWins.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Tidak ada tugas mendesak</p>
                ) : (
                  analytics.matrix.quickWins.slice(0, 3).map((t) => (
                    <div key={t.id} className="text-xs font-semibold text-slate-800 bg-white/90 p-2 rounded-xl border border-amber-100 truncate shadow-2xs">
                      • {t.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Kuadran 4: ROUTINE & BACKLOG (Medium/Low + Deadline > 24 jam) */}
          <div className="p-4 rounded-2xl bg-slate-100/80 border-2 border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Kuadran 4: Rutinitas & Santai
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                  {analytics.matrix.routine.length} Tugas
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                Tugas santai atau pekerjaan berkala yang tidak mendesak.
              </p>

              {/* Task Preview */}
              <div className="space-y-1.5">
                {analytics.matrix.routine.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Tidak ada tugas santai</p>
                ) : (
                  analytics.matrix.routine.slice(0, 3).map((t) => (
                    <div key={t.id} className="text-xs font-semibold text-slate-800 bg-white/90 p-2 rounded-xl border border-slate-200 truncate shadow-2xs">
                      • {t.title}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
