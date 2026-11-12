import React, { useState, useEffect } from 'react';
import { X, Edit3, Loader2, AlertCircle, Bell, Calendar, Clock } from 'lucide-react';
import { parseLocalDate, getMinDateString } from '../utils/todoHelpers';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low (Santai)' },
  { value: 'medium', label: 'Medium (Standar)' },
  { value: 'high', label: 'High (Mendesak)' },
];

export default function EditModal({
  isOpen,
  onClose,
  todo,
  onUpdateTodo,
  isSubmitting,
}) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState('30m');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '');
      setPriority(todo.priority || 'medium');
      if (todo.due_date) {
        if (todo.due_date.includes('T')) {
          const [d, t] = todo.due_date.split('T');
          setDueDate(d);
          setDueTime(t);
        } else {
          setDueDate(todo.due_date);
          setDueTime('23:59');
        }
      } else {
        setDueDate('');
        setDueTime('');
      }
      setReminder(todo.reminder || '30m');
      setValidationError('');
    }
  }, [todo]);

  if (!isOpen || !todo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Judul tugas tidak boleh kosong.');
      return;
    }

    // 1. Validasi Tanggal (Hari) WAJIB
    if (!dueDate) {
      setValidationError('Harap tentukan tanggal (hari) deadline tugas terlebih dahulu!');
      return;
    }

    // 2. Validasi Jam WAJIB
    if (!dueTime) {
      setValidationError('Harap tentukan jam deadline tugas terlebih dahulu!');
      return;
    }

    // 3. Validasi waktu tidak boleh masa lalu (jika diubah)
    const finalDueDate = `${dueDate}T${dueTime}`;
    if (finalDueDate !== todo.due_date) {
      const parsed = parseLocalDate(finalDueDate);
      if (parsed) {
        const now = new Date();
        if (parsed.getTime() < now.getTime() - 60000) {
          setValidationError('Tenggat waktu tidak boleh tanggal atau jam yang sudah lewat!');
          return;
        }
      }
    }

    setValidationError('');
    const success = await onUpdateTodo(todo.id, {
      title: trimmedTitle,
      priority,
      due_date: finalDueDate,
      reminder,
    });
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Tugas</h3>
              <p className="text-xs text-slate-500">Perbarui judul atau tenggat waktu tugas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                validationError
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
              autoFocus
            />
            {validationError && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Prioritas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pengingat Notifikasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pengingat Notifikasi
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <select
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="30m">🔔 30 Menit (Standar)</option>
                  <option value="1h">🔔 1 Jam sebelumnya</option>
                  <option value="5m">🔔 5 Menit (Segera)</option>
                  <option value="none">🔕 Tanpa Notifikasi</option>
                </select>
              </div>
            </div>

            {/* Tanggal Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tanggal Deadline <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                min={getMinDateString()}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (!dueTime && e.target.value) {
                    setDueTime('23:59');
                  }
                  if (validationError) setValidationError('');
                }}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border bg-white text-slate-800 focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                  validationError && !dueDate
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                title="Pilih tanggal deadline (Wajib)"
              />
            </div>

            {/* Jam Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Jam Deadline <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => {
                  setDueTime(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border bg-white text-slate-800 focus:outline-none focus:ring-2 cursor-pointer transition-all ${
                  validationError && !dueTime
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                title="Pilih jam deadline (Wajib)"
              />
            </div>

            {/* Pilihan Jam Cepat Presets */}
            <div className="sm:col-span-2 pt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" />
                Preset Jam:
              </span>
              {[
                { label: '09:00', val: '09:00' },
                { label: '12:00', val: '12:00' },
                { label: '17:00', val: '17:00' },
                { label: '21:00', val: '21:00' },
                { label: '23:59', val: '23:59' },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => {
                    if (!dueDate) {
                      setDueDate(getMinDateString());
                    }
                    setDueTime(preset.val);
                    if (validationError) setValidationError('');
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    dueTime === preset.val
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

