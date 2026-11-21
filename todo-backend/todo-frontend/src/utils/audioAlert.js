/**
 * audioAlert.js
 * Modul pemutar nada dering (ringtone chime) untuk pengingat deadline.
 * Menggabungkan Web Audio API Synthesizer dengan fallback file WAV.
 */

let audioCtx = null;
let loopIntervalId = null;
let loopTimeoutId = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Memainkan nada akustik harmonis melalui Web Audio API Oscillator
 */
function playSynthesizedChime(ctx) {
  const now = ctx.currentTime;

  const notes = [
    { freq: 523.25, time: 0.0, dur: 0.5 },  // C5
    { freq: 659.25, time: 0.12, dur: 0.5 }, // E5
    { freq: 783.99, time: 0.24, dur: 0.6 }, // G5
    { freq: 1046.50, time: 0.38, dur: 0.8 }, // C6
    { freq: 1318.51, time: 0.70, dur: 1.1 }, // E6
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    // Envelope Attack & Exponential Decay
    gain.gain.setValueAtTime(0.001, now + n.time);
    gain.gain.linearRampToValueAtTime(0.3, now + n.time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur);
  });
}

/**
 * Memainkan nada dering pengingat deadline Kelarin
 * Mendukung Web Audio API dan HTML5 Audio element.
 */
export function playDeadlineRingtone() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state !== 'suspended') {
      playSynthesizedChime(ctx);
      return;
    }

    // Fallback HTML5 Audio
    const audio = new Audio('/sounds/ringtone.wav');
    audio.volume = 0.8;
    audio.play().catch(() => {
      // Browser autoplay policy might block if user hasn't interacted yet
    });
  } catch (err) {
    console.warn('Gagal memutar nada dering:', err);
  }
}

/**
 * Menghentikan pengulangan nada dering loop
 */
export function stopDeadlineRingtoneLoop() {
  if (loopIntervalId) {
    clearInterval(loopIntervalId);
    loopIntervalId = null;
  }
  if (loopTimeoutId) {
    clearTimeout(loopTimeoutId);
    loopTimeoutId = null;
  }
}

/**
 * Memutar nada dering berulang (loop) selama durasi tertentu (default 60.000 ms / 1 menit)
 * Berhenti otomatis saat waktu habis atau saat pengguna menandai selesai / menutup alert.
 */
export function startDeadlineRingtoneLoop(durationMs = 60000, onComplete) {
  stopDeadlineRingtoneLoop();

  // Bunyikan nada pertama segera
  playDeadlineRingtone();

  // Ulangi nada melodi setiap 2.8 detik
  loopIntervalId = setInterval(() => {
    playDeadlineRingtone();
  }, 2800);

  // Auto-stop setelah 1 menit
  loopTimeoutId = setTimeout(() => {
    stopDeadlineRingtoneLoop();
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }, durationMs);
}

/**
 * Meminta izin notifikasi browser dari pengguna
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

/**
 * Menampilkan notifikasi desktop browser dengan nada dering
 */
export function showBrowserNotification(title, body) {
  playDeadlineRingtone();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
        silent: false,
      });
    } catch (e) {
      console.warn('Gagal memicu browser notification:', e);
    }
  }
}

