import React, { useState, useRef, useEffect } from 'react';
import { sendAiCommand, getGeminiApiKey, setGeminiApiKey } from '../services/aiService';
import {
  Sparkles,
  Send,
  Loader2,
  Check,
  Plus,
  Clock,
  Bell,
  Trash2,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Key,
  X,
  ExternalLink,
} from 'lucide-react';

const SUGGESTIONS = [
  'Besok jam 09:00 ingatkan bikin laporan, prioritas high, notif 30 menit',
  'Tolong tambahkan tugas beli keperluan kelompok nanti sore jam 17:00',
  'Apa tugas saya yang paling mendesak saat ini?',
  'Jadwalkan belajar matematika lusa jam 14:00',
];

export default function AiAssistant({
  currentTodos = [],
  onAddTodo,
  onOpenCalendar,
  isOpen = true,
  onClose,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! Saya **Kelarin AI** (didukung Google Gemini 2.5 Flash). Kamu bisa memberi saya perintah dalam bahasa santai untuk menambahkan tugas atau menjadwalkan deadline secara otomatis.',
      todos: [],
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTodoIds, setAddedTodoIds] = useState(new Set());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const existing = getGeminiApiKey();
    setHasCustomKey(Boolean(existing));
    if (existing) setKeyInput(existing);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    setGeminiApiKey(keyInput.trim());
    setHasCustomKey(Boolean(keyInput.trim()));
    setShowKeyModal(false);
  };

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const result = await sendAiCommand(prompt, currentTodos, history);

      const aiMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: result.reply,
        action: result.action,
        todos: result.todos || [],
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Jika pengguna meminta menambahkan tugas, tawarkan atau otomatis tambahkan
      // Di sini kita sediakan tombol 1-klik untuk konfirmasi langsung di kartu
    } catch (err) {
      console.error('Error sendAiCommand:', err);
      const errorMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        isError: true,
        text: `Maaf, terjadi kendala saat memproses perintah: ${err.message || 'Coba periksa koneksi atau API Key.'}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handler: Tambahkan tugas yang diekstrak AI ke daftar to-do
  const handleAddAiTodo = async (todoItem, messageId, index) => {
    const key = `${messageId}_${index}`;
    if (addedTodoIds.has(key)) return;

    if (onAddTodo) {
      const success = await onAddTodo(
        todoItem.title,
        todoItem.priority || 'medium',
        todoItem.due_date || '',
        todoItem.reminder || '30m'
      );
      if (success) {
        setAddedTodoIds((prev) => new Set(prev).add(key));
      }
    }
  };

  // Handler: Tambahkan semua tugas dalam satu pesan sekaligus
  const handleAddAllAiTodos = async (todosList, messageId) => {
    for (let i = 0; i < todosList.length; i++) {
      await handleAddAiTodo(todosList[i], messageId, i);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Riwayat percakapan telah dibersihkan. Silakan beri perintah baru!',
        todos: [],
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setAddedTodoIds(new Set());
  };

  return (
    <div className="flex flex-col h-[650px] sm:h-[720px] bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Header AI Assistant */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight text-white">
                Kelarin AI Assistant
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Online • Tambah tugas via teks bebas</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Pengaturan Google Gemini API Key"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Bersihkan riwayat percakapan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Coba:
        </span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(s)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0 shadow-2xs"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Thread Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          const hasTodos = Array.isArray(msg.todos) && msg.todos.length > 0;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isModel ? 'justify-start' : 'justify-end'
              }`}
            >
              {isModel && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isModel
                    ? msg.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-800'
                      : 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                {/* Text Message */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* AI Extracted Todo Cards */}
                {hasTodos && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                      <span>Tugas yang Disiapkan AI ({msg.todos.length}):</span>
                      {msg.todos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddAllAiTodos(msg.todos, msg.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          + Tambahkan Semua
                        </button>
                      )}
                    </div>

                    {msg.todos.map((todoItem, idx) => {
                      const isAdded = addedTodoIds.has(`${msg.id}_${idx}`);
                      const isHigh = (todoItem.priority || '').toLowerCase() === 'high';
                      const isMedium = (todoItem.priority || '').toLowerCase() === 'medium';

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border transition-all text-xs ${
                            isAdded
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-slate-50 border-slate-200/80 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900 break-words flex-1">
                              {todoItem.title}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                isHigh
                                  ? 'bg-rose-100 text-rose-700'
                                  : isMedium
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {todoItem.priority || 'medium'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 mt-1.5">
                            {todoItem.due_date && (
                              <span className="flex items-center gap-1 font-medium text-slate-600">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {todoItem.due_date.replace('T', ' ')}
                              </span>
                            )}
                            {todoItem.reminder && todoItem.reminder !== 'none' && (
                              <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                                <Bell className="w-3 h-3" />
                                {todoItem.reminder}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex justify-end">
                            {isAdded ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ditambahkan
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddAiTodo(todoItem, msg.id, idx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                                <span>Tambah ke Daftar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className={`text-[9px] text-right mt-1.5 ${
                    isModel ? 'text-slate-400' : 'text-indigo-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isModel && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs shadow-xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Kelarin AI sedang memproses perintahmu...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Bar */}
      <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik perintah (contoh: Besok jam 9 pagi ingatkan bikin tugas)..."
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 disabled:opacity-60 pr-10"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-1.5 p-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            title="Kirim perintah ke AI"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          Tekan <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Enter</kbd> untuk mengirim. Didukung Google Gemini AI.
        </p>
      </div>

      {/* Modal Pengaturan Google Gemini API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Key className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Google Gemini API Key</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Key Anda:
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Masukkan Google API Key..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Tersimpan secara aman di browser lokal Anda (Local Storage / .env).
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  <span>Dapatkan API Key Gratis</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeminiApiKey('');
                      setKeyInput('');
                      setHasCustomKey(false);
                      setShowKeyModal(false);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
