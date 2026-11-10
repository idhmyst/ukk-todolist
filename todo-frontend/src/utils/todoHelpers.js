/**
 * todoHelpers.js
 * Utilitas untuk kalkulasi tenggat waktu (due date), urgensi tugas, dan smart sorting.
 */

export const PRIORITY_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Parsing tanggal lokal format YYYY-MM-DD secara aman tanpa time-shift zona waktu
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Menghitung selisih hari dan metadata urgensi tenggat waktu
 */
export function getDeadlineInfo(dueDateStr) {
  if (!dueDateStr) return null;
  const dueDate = parseLocalDate(dueDateStr);
  if (!dueDate) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round((targetDay.getTime() - today.getTime()) / msPerDay);

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dueDate);

  return {
    diffDays,
    isOverdue: diffDays < 0,
    isToday: diffDays === 0,
    isTomorrow: diffDays === 1,
    isApproaching: diffDays > 1 && diffDays <= 3,
    formattedDate,
  };
}

/**
 * Format tanggal umum Indonesia (misal: 3 Nov 2026)
 */
export function formatIndonesianDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Smart Sorting untuk Todos:
 * Mendukung mode 'urgency' (Prioritas + Deadline Terdekat), 'deadline', 'priority', dan 'newest'.
 */
export function sortTodos(todos, sortBy = 'urgency') {
  return [...todos].sort((a, b) => {
    // 1. Tugas belum selesai selalu berada di atas tugas yang sudah selesai
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }

    // Jika keduanya sudah selesai, urutkan berdasarkan yang paling baru dibuat
    if (a.is_completed && b.is_completed) {
      return (b.id || 0) - (a.id || 0);
    }

    const timeA = a.due_date ? parseLocalDate(a.due_date)?.getTime() || null : null;
    const timeB = b.due_date ? parseLocalDate(b.due_date)?.getTime() || null : null;
    const priorityA = PRIORITY_WEIGHT[(a.priority || 'medium').toLowerCase()] || 2;
    const priorityB = PRIORITY_WEIGHT[(b.priority || 'medium').toLowerCase()] || 2;

    if (sortBy === 'deadline') {
      // Prioritas 1: Deadline terdekat (termasuk Terlewat -> Hari ini -> Besok -> Mendatang)
      if (timeA !== null && timeB !== null) {
        if (timeA !== timeB) return timeA - timeB;
      } else if (timeA !== null && timeB === null) {
        return -1;
      } else if (timeA === null && timeB !== null) {
        return 1;
      }
      // Prioritas 2: Level prioritas High > Medium > Low
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      return (b.id || 0) - (a.id || 0);
    }

    if (sortBy === 'priority') {
      // Prioritas utama: High > Medium > Low
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      return (b.id || 0) - (a.id || 0);
    }

    if (sortBy === 'newest') {
      return (b.id || 0) - (a.id || 0);
    }

    // Default: 'urgency' (Prioritas Tinggi + Deadline Terdekat di Atas)
    // 1. Urgensi Prioritas: High (3) > Medium (2) > Low (1)
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    // 2. Dalam prioritas yang sama: yang ada deadline lebih atas dibanding yang tidak ada
    if (timeA !== null && timeB !== null) {
      if (timeA !== timeB) return timeA - timeB; // Tanggal lebih awal (terlewat/hari ini/besok) di atas
    } else if (timeA !== null && timeB === null) {
      return -1;
    } else if (timeA === null && timeB !== null) {
      return 1;
    }

    // 3. Jika tanggal sama atau sama-sama tanpa deadline: yang terbaru di atas
    return (b.id || 0) - (a.id || 0);
  });
}

/**
 * Mengelompokkan tugas aktif berdasarkan waktu deadline (Per Hari / Timeline)
 */
export function groupTodosByDate(todos) {
  const groups = {
    overdue: [],
    today: [],
    tomorrow: [],
    upcoming: [],
    no_date: [],
  };

  todos.forEach((todo) => {
    if (!todo.due_date) {
      groups.no_date.push(todo);
      return;
    }
    const info = getDeadlineInfo(todo.due_date);
    if (!info) {
      groups.no_date.push(todo);
    } else if (info.isOverdue) {
      groups.overdue.push(todo);
    } else if (info.isToday) {
      groups.today.push(todo);
    } else if (info.isTomorrow) {
      groups.tomorrow.push(todo);
    } else {
      groups.upcoming.push(todo);
    }
  });

  const sections = [];
  if (groups.overdue.length > 0) {
    sections.push({
      id: 'overdue',
      title: 'Terlewat (Overdue)',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold',
      items: groups.overdue,
    });
  }
  if (groups.today.length > 0) {
    sections.push({
      id: 'today',
      title: 'Hari Ini',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      items: groups.today,
    });
  }
  if (groups.tomorrow.length > 0) {
    sections.push({
      id: 'tomorrow',
      title: 'Besok',
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
      items: groups.tomorrow,
    });
  }
  if (groups.upcoming.length > 0) {
    sections.push({
      id: 'upcoming',
      title: 'Mendatang',
      badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold',
      items: groups.upcoming,
    });
  }
  if (groups.no_date.length > 0) {
    sections.push({
      id: 'no_date',
      title: 'Tanpa Tenggat Waktu',
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium',
      items: groups.no_date,
    });
  }

  return sections;
}

/**
 * Mengelompokkan tugas aktif berdasarkan level urgensi prioritas (High > Medium > Low)
 */
export function groupTodosByPriority(todos) {
  const groups = {
    high: [],
    medium: [],
    low: [],
  };

  todos.forEach((todo) => {
    const p = (todo.priority || 'medium').toLowerCase();
    if (p === 'high') {
      groups.high.push(todo);
    } else if (p === 'low') {
      groups.low.push(todo);
    } else {
      groups.medium.push(todo);
    }
  });

  const sections = [];
  if (groups.high.length > 0) {
    sections.push({
      id: 'high',
      title: 'Prioritas Mendesak (High)',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold',
      items: groups.high,
    });
  }
  if (groups.medium.length > 0) {
    sections.push({
      id: 'medium',
      title: 'Prioritas Standar (Medium)',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      items: groups.medium,
    });
  }
  if (groups.low.length > 0) {
    sections.push({
      id: 'low',
      title: 'Prioritas Santai (Low)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
      items: groups.low,
    });
  }

  return sections;
}

