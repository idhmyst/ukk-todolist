import React, { useState, useRef, useEffect } from 'react';
import { sendAiCommand, stripMarkdownSymbols } from '../services/aiService';
import {
  Sparkles,
  Send,
  Loader2,
  Plus,
  Clock,
  Bell,
  Trash2,
  Bot,
  User,
  CheckCircle2,
  Minus,
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
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      text: 'Halo! Mau catat atau cek tugas apa hari ini?',
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
      // Pastikan due_date selalu terisi sesuai aturan sistem
      let finalDueDate = todoItem.due_date || '';
      if (!finalDueDate) {
        const today = new Date().toISOString().split('T')[0];
        finalDueDate = `${today}T23:59`;
      }

      const success = await onAddTodo(
        todoItem.title,
        todoItem.priority || 'medium',
        finalDueDate,
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
        text: 'Obrolan dibersihkan. Mau catat tugas apa?',
        todos: [],
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setAddedTodoIds(new Set());
  };

  return (
    <div className="flex flex-col h-[620px] sm:h-[700px] bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/90 overflow-hidden transition-all">
      {/* Header AI Assistant */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight text-white">
                Kelarin AI
              </h3>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                v2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Online • Asisten Jadwal & Tugas</span>
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
              title="Minimize Kelarin AI"
            >
              <Minus className="w-4 h-4" />
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
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Coba:
        </span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(s.text)}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-all whitespace-nowrap cursor-pointer flex-shrink-0 shadow-2xs"
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
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isModel
                    ? msg.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 shadow-2xs rounded-tl-xs'
                    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-medium rounded-tr-xs'
                }`}
              >
                {/* Text Message */}
                <p className="whitespace-pre-wrap">{cleanText}</p>

                {/* AI Extracted Todo Cards */}
                {hasTodos && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>Tugas yang disiapkan ({msg.todos.length}):</span>
                      {msg.todos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddAllAiTodos(msg.todos, msg.id)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          + Tambah Semua
                        </button>
                      )}
                    </div>

                    {msg.todos.map((todoItem, idx) => {
                      const isAdded = addedTodoIds.has(`${msg.id}_${idx}`);
                      const prio = (todoItem.priority || 'medium').toLowerCase();
                      const isHigh = prio === 'high';
                      const isMedium = prio === 'medium';

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border transition-all text-xs ${
                            isAdded
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : isHigh
                              ? 'bg-white border-slate-200 border-l-4 border-l-rose-500 shadow-2xs'
                              : isMedium
                              ? 'bg-white border-slate-200 border-l-4 border-l-amber-500 shadow-2xs'
                              : 'bg-white border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 break-words flex-1">
                              {todoItem.title}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isHigh
                                  ? 'bg-rose-100 text-rose-700'
                                  : isMedium
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {prio === 'high' ? 'High' : prio === 'low' ? 'Low' : 'Medium'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 mt-1.5">
                            {todoItem.due_date && (
                              <span className="flex items-center gap-1 font-semibold text-slate-700">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                {todoItem.due_date.replace('T', ' ')}
                              </span>
                            )}
                            {todoItem.reminder && todoItem.reminder !== 'none' && (
                              <span className="flex items-center gap-0.5 text-indigo-600 font-semibold">
                                <Bell className="w-3 h-3" />
                                {todoItem.reminder}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex justify-end">
                            {isAdded ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ditambahkan
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddAiTodo(todoItem, msg.id, idx)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
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
                  className={`text-[9px] text-right mt-1.5 font-medium ${
                    isModel ? 'text-slate-400' : 'text-indigo-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isModel && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-600 flex items-center gap-2 shadow-2xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Memproses perintah...</span>
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
          className="relative flex items-center bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-600 border border-slate-200 rounded-2xl p-1 transition-all"
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
            className="w-8 h-8 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shadow-xs flex-shrink-0"
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
