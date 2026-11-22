import React, { useState, useRef, useEffect } from 'react';
import {
  sendAiCommand,
  stripMarkdownSymbols,
  getAiProvider,
  setAiProvider,
} from '../services/aiService';
import {
  Sparkles,
  Zap,
  Send,
  Loader2,
  Plus,
  Clock,
  Bell,
  Trash2,
  Bot,
  User,
  CheckCircle2,
  Minimize2,
  X,
} from 'lucide-react';

const SUGGESTIONS = [
  {
    label: '+ Laporan besok 09:00',
    text: 'Besok jam 09:00 ingatkan bikin laporan, prioritas high, notif 30 menit',
  },
  {
    label: '+ Cuci motor sore 17:00',
    text: 'Tolong tambahkan tugas cuci motor nanti sore jam 17:00',
  },
  {
    label: '⚡ Tugas paling mendesak?',
    text: 'Apa tugas saya yang paling mendesak saat ini?',
  },
  {
    label: '📅 Cek jadwal lusa',
    text: 'Ada jadwal tugas apa untuk lusa?',
  },
];

export default function AiAssistant({
  currentTodos = [],
  onAddTodo,
  onOpenCalendar,
  isOpen = true,
  onClose,
  onMinimize,
}) {
  const [aiProvider, setAiProviderState] = useState(getAiProvider());
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! Saya Kelarin AI. Mau catat atau cek tugas apa hari ini?',
      todos: [],
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTodoIds, setAddedTodoIds] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleToggleProvider = () => {
    const next = aiProvider === 'groq' ? 'gemini' : 'groq';
    setAiProvider(next);
    setAiProviderState(next);
  };

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
        text: stripMarkdownSymbols(result.reply),
        action: result.action,
        todos: result.todos || [],
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sendAiCommand:', err);
      const errorMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        isError: true,
        text: `Terjadi kendala: ${err.message || 'Coba periksa koneksi internet.'}`,
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
      let finalDueDate = todoItem.due_date || '';
      if (!finalDueDate) {
        const today = new Date().toISOString().split('T')[0];
        finalDueDate = `${today}T23:59`;
      }

      await onAddTodo({
        title: todoItem.title,
        priority: todoItem.priority || 'medium',
        due_date: finalDueDate,
        reminder: todoItem.reminder || '30m',
      });

      setAddedTodoIds((prev) => new Set([...prev, key]));
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'Obrolan dibersihkan. Mau catat tugas apa?',
        todos: [],
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setAddedTodoIds(new Set());
  };

  const isGroq = aiProvider === 'groq';

  return (
    <div className="relative flex flex-col h-[620px] sm:h-[700px] bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/90 overflow-hidden transition-all">
      {/* Header AI Assistant */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0 transition-colors ${
              isGroq
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                : 'bg-gradient-to-tr from-indigo-500 to-violet-500'
            }`}
          >
            {isGroq ? <Zap className="w-4 h-4 fill-white" /> : <Sparkles className="w-4 h-4 text-white" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight text-white">
                Kelarin AI
              </h3>
              {/* Quick Toggle Engine Badge */}
              <button
                type="button"
                onClick={handleToggleProvider}
                title={`Sedang menggunakan ${isGroq ? 'Groq LPU' : 'Gemini Cloud'}. Klik untuk beralih engine.`}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                  isGroq
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
                }`}
              >
                {isGroq ? (
                  <>
                    <Zap className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    <span>⚡ Groq LPU</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                    <span>✨ Gemini</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 min-h-[16px]">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="flex items-center gap-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                      style={{ animationDuration: '700ms', animationDelay: '0ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                      style={{ animationDuration: '700ms', animationDelay: '180ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                      style={{ animationDuration: '700ms', animationDelay: '360ms' }}
                    />
                  </span>
                  <span className="font-medium text-[10.5px]">Sedang mengetik...</span>
                </span>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span className="text-emerald-400/90 font-medium">Online</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Tombol Minimize AI */}
          {onMinimize && (
            <button
              type="button"
              onClick={onMinimize}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimize ke tombol melayang"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}

          {/* Tombol Bersihkan Chat */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Bersihkan riwayat percakapan"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Tombol Close di Mobile */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer lg:hidden"
              title="Tutup asisten"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 flex-shrink-0 mr-0.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Coba:
        </span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(s.text)}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-200 transition-all whitespace-nowrap cursor-pointer flex-shrink-0 shadow-2xs"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat Thread Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40">
        {messages.map((msg) => {
          const isModel = msg.role === 'model';
          const hasTodos = Array.isArray(msg.todos) && msg.todos.length > 0;
          const cleanText = stripMarkdownSymbols(msg.text);

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isModel ? 'justify-start' : 'justify-end'
              }`}
            >
              {isModel && (
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-2xs mt-0.5 ${
                    msg.isError
                      ? 'bg-rose-500'
                      : isGroq
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                      : 'bg-gradient-to-tr from-indigo-500 to-violet-500'
                  }`}
                >
                  {isGroq && !msg.isError ? (
                    <Zap className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-xs sm:text-[13px] leading-relaxed transition-all ${
                  isModel
                    ? msg.isError
                      ? 'bg-rose-500/10 border border-rose-200 text-rose-800 rounded-tl-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                    : 'bg-indigo-600 text-white rounded-tr-xs shadow-indigo-200'
                }`}
              >
                {/* Teks Pesan */}
                <p className="whitespace-pre-wrap">{cleanText}</p>

                {/* Kartu Tugas yang Diekstrak AI */}
                {hasTodos && (
                  <div className="mt-3 space-y-2 pt-2.5 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Tugas yang disiapkan AI:
                    </p>
                    {msg.todos.map((todo, idx) => {
                      const itemKey = `${msg.id}_${idx}`;
                      const isAdded = addedTodoIds.has(itemKey);

                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-2 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-800 text-xs truncate">
                                {todo.title}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  todo.priority === 'high'
                                    ? 'bg-rose-100 text-rose-700'
                                    : todo.priority === 'low'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {todo.priority || 'medium'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              {todo.due_date && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {todo.due_date.replace('T', ' ')}
                                </span>
                              )}
                              {todo.reminder && todo.reminder !== 'none' && (
                                <span className="flex items-center gap-1">
                                  <Bell className="w-3 h-3 text-amber-500" />
                                  {todo.reminder}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddAiTodo(todo, msg.id, idx)}
                            disabled={isAdded}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer flex-shrink-0 ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-2xs hover:scale-105 active:scale-95'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Ditambahkan
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                Tambah
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    isModel ? 'text-slate-400' : 'text-indigo-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Animation in Chat Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
            <div
              className={`w-7 h-7 rounded-xl text-white flex items-center justify-center flex-shrink-0 shadow-2xs ${
                isGroq
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                  : 'bg-gradient-to-tr from-indigo-500 to-violet-500'
              }`}
            >
              {isGroq ? <Zap className="w-3.5 h-3.5 fill-white" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 py-0.5">
                <span
                  className={`w-2 h-2 rounded-full animate-bounce ${isGroq ? 'bg-amber-500' : 'bg-indigo-600'}`}
                  style={{ animationDuration: '700ms', animationDelay: '0ms' }}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce ${isGroq ? 'bg-amber-500' : 'bg-indigo-600'}`}
                  style={{ animationDuration: '700ms', animationDelay: '180ms' }}
                />
                <span
                  className={`w-2 h-2 rounded-full animate-bounce ${isGroq ? 'bg-amber-500' : 'bg-indigo-600'}`}
                  style={{ animationDuration: '700ms', animationDelay: '360ms' }}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Sedang mengetik...
              </span>
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
          className="relative flex items-center bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-100 focus-within:border-amber-600 border border-slate-200 rounded-2xl p-1 transition-all"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik perintah (contoh: Besok jam 9 pagi buat laporan)..."
            disabled={isLoading}
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400 disabled:opacity-60 pr-10"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className={`w-8 h-8 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center shadow-xs flex-shrink-0 ${
              isGroq
                ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400'
                : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400'
            }`}
            title="Kirim perintah ke AI"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          Tekan <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-500">Enter</kbd> untuk mengirim
        </p>
      </div>
    </div>
  );
}
