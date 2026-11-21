import React, { useState, useRef, useEffect } from 'react';
import {
  sendAiCommand,
  stripMarkdownSymbols,
  getAiProvider,
  setAiProvider,
  getOllamaConfig,
  setOllamaConfig,
  getGeminiApiKey,
  setGeminiApiKey,
  checkOllamaStatus,
} from '../services/aiService';
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
  Minimize2,
  X,
  Settings,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Link2,
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
  const [provider, setProviderState] = useState(getAiProvider());
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTodoIds, setAddedTodoIds] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Settings Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [ollamaUrlInput, setOllamaUrlInput] = useState(getOllamaConfig().url);
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showKey, setShowKey] = useState(false);

  const toggleProvider = () => {
    const next = provider === 'ollama' ? 'gemini' : 'ollama';
    setProviderState(next);
    setAiProvider(next);
  };

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTestOllama = async () => {
    setIsTestingOllama(true);
    setTestResult(null);
    try {
      const res = await checkOllamaStatus(ollamaUrlInput);
      if (res.online) {
        setTestResult({
          success: true,
          message: `Berhasil terhubung ke Ollama! Model aktif: ${res.models?.join(', ') || 'qwen2.5:3b'}`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Tidak dapat terhubung: ${res.error || 'Pastikan Ollama atau hubungkan-ollama.bat aktif'}`,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${err.message}`,
      });
    } finally {
      setIsTestingOllama(false);
    }
  };

  const handleSaveSettings = () => {
    setOllamaConfig(ollamaUrlInput.trim(), 'qwen2.5:3b');
    setGeminiApiKey(geminiKeyInput.trim());
    setShowSettings(false);
    setTestResult(null);
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
        originalPrompt: prompt,
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
    <div className="relative flex flex-col h-[620px] sm:h-[700px] bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/90 overflow-hidden transition-all">
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
              <button
                type="button"
                onClick={toggleProvider}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                title="Klik untuk beralih antara Ollama Qwen dan Gemini"
              >
                <span>{provider === 'ollama' ? '🦙 Qwen 2.5 3B' : '✨ Gemini Flash'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${provider === 'ollama' ? 'bg-emerald-400' : 'bg-indigo-400'} inline-block`} />
              <span>{provider === 'ollama' ? 'Ollama • Bebas Key' : 'Online • Google Gemini Cloud'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Tombol Pengaturan AI */}
          <button
            type="button"
            onClick={() => {
              setShowSettings(true);
              setOllamaUrlInput(getOllamaConfig().url);
              setGeminiKeyInput(getGeminiApiKey());
              setTestResult(null);
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Pengaturan Model & Koneksi AI"
          >
            <Settings className="w-4 h-4" />
          </button>

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

      {/* Modal Pengaturan AI Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[92%] animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold">Pengaturan Koneksi AI</h4>
              </div>
              <button
                type="button"
                onClick={() => { setShowSettings(false); setTestResult(null); }}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              {/* Pilihan Provider */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Pilih Model AI:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setProviderState('ollama'); setAiProvider('ollama'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      provider === 'ollama'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px] flex items-center gap-1">
                      <span>🦙 Ollama</span>
                      {provider === 'ollama' && <Check className="w-3 h-3 text-indigo-600 ml-auto" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Qwen 2.5 3B (Lokal)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setProviderState('gemini'); setAiProvider('gemini'); }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      provider === 'gemini'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px] flex items-center gap-1">
                      <span>✨ Gemini</span>
                      {provider === 'gemini' && <Check className="w-3 h-3 text-indigo-600 ml-auto" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Google Cloud 2.5</p>
                  </button>
                </div>
              </div>

              {/* Konfigurasi Ollama */}
              {provider === 'ollama' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">URL Ollama / Tunnel:</label>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={ollamaUrlInput}
                      onChange={(e) => setOllamaUrlInput(e.target.value)}
                      placeholder="http://localhost:11434 atau https://xxxx.trycloudflare.com"
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestOllama}
                      disabled={isTestingOllama || !ollamaUrlInput.trim()}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold disabled:opacity-50 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isTestingOllama ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Tes'}
                    </button>
                  </div>

                  {/* Feedback Status Tes */}
                  {testResult && (
                    <div
                      className={`p-2 rounded-xl text-[10px] leading-tight flex items-start gap-1.5 ${
                        testResult.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  {/* Tips Vercel Tunnel */}
                  <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[10px] text-indigo-900 leading-relaxed">
                    <p className="font-bold flex items-center gap-1 text-indigo-950">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Cara Hubungkan ke Vercel Cloud:
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5 mt-1 text-indigo-800">
                      <li>Jalankan file <code className="bg-indigo-100/90 px-1 py-0.2 rounded font-mono font-bold text-indigo-950">hubungkan-ollama.bat</code> di laptop.</li>
                      <li>Salin URL HTTPS yang muncul (<code className="font-mono">https://xxxx.trycloudflare.com</code>).</li>
                      <li>Tempel ke kolom URL di atas, klik <b>Tes</b> lalu <b>Simpan</b>.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Konfigurasi Gemini */}
              {provider === 'gemini' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block">Google Gemini API Key:</label>
                  <div className="relative flex items-center">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={geminiKeyInput}
                      onChange={(e) => setGeminiKeyInput(e.target.value)}
                      placeholder="Masukkan Gemini API Key..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Gratis dari Google AI Studio. Berjalan 100% di cloud Vercel tanpa butuh laptop menyala.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowSettings(false); setTestResult(null); }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

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

                {/* Tombol Bantuan Cepat saat terjadi kendala */}
                {msg.isError && (
                  <div className="mt-2.5 pt-2 border-t border-rose-200/60 flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setProviderState('ollama');
                        setAiProvider('ollama');
                        if (msg.originalPrompt) handleSendMessage(msg.originalPrompt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>🦙 Coba Pakai Ollama</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProviderState('gemini');
                        setAiProvider('gemini');
                        if (msg.originalPrompt) handleSendMessage(msg.originalPrompt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>✨ Coba Pakai Gemini</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Pengaturan</span>
                    </button>
                  </div>
                )}

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
                      const priorityColor =
                        prio === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : prio === 'low'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700';

                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-800 text-xs">
                                {todoItem.title}
                              </span>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${priorityColor}`}
                              >
                                {prio}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                              {todoItem.due_date && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {todoItem.due_date.replace('T', ' ')}
                                </span>
                              )}
                              {todoItem.reminder && todoItem.reminder !== 'none' && (
                                <span className="flex items-center gap-1">
                                  <Bell className="w-3 h-3 text-slate-400" />
                                  {todoItem.reminder}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddAiTodo(todoItem, msg.id, idx)}
                            disabled={isAdded}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer flex-shrink-0 ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
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
