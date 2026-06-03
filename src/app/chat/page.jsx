'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, User, Copy, ThumbsUp, ThumbsDown,
  Trash2, Loader2, Sparkles, Code2, BookOpen, HelpCircle, Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// ── helpers ──────────────────────────────────────────────
function CodeBlock({ code, lang }) {
  const copy = () => { navigator.clipboard.writeText(code); toast.success('Nusxalandi!'); };
  return (
    <div className="relative my-2 rounded-xl overflow-hidden border border-dark-border">
      <div className="flex items-center justify-between px-4 py-1.5 bg-dark-bg border-b border-dark-border">
        <span className="text-slate-500 text-xs font-mono">{lang || 'code'}</span>
        <button onClick={copy} className="text-slate-500 hover:text-white text-xs transition-colors">Nusxa</button>
      </div>
      <pre className="bg-dark-bg p-4 overflow-x-auto text-sm">
        <code className="text-slate-200 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function MessageContent({ content }) {
  // Simple markdown-like rendering
  const parts = [];
  const codeRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1], content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return (
    <div className="text-sm leading-relaxed">
      {parts.map((p, i) => {
        if (p.type === 'code') return <CodeBlock key={i} code={p.content} lang={p.lang} />;
        // Text with inline code, bold, etc.
        const formatted = p.content
          .split(/(`[^`]+`)/g)
          .map((seg, j) => {
            if (seg.startsWith('`') && seg.endsWith('`')) {
              return <code key={j} className="bg-dark-bg text-brand-400 px-1.5 py-0.5 rounded text-xs font-mono border border-dark-border">{seg.slice(1, -1)}</code>;
            }
            // Bold
            return seg.split(/(\*\*[^*]+\*\*)/g).map((s, k) => {
              if (s.startsWith('**') && s.endsWith('**')) {
                return <strong key={k} className="text-white font-semibold">{s.slice(2, -2)}</strong>;
              }
              return <span key={k}>{s}</span>;
            });
          });
        return <span key={i}>{formatted}</span>;
      })}
    </div>
  );
}

function MessageBubble({ msg, onCopy }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-brand-500' : 'bg-gradient-to-br from-emerald-500 to-cyan-500'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={isUser
          ? 'bg-brand-600 text-white rounded-xl rounded-br-sm px-4 py-3'
          : 'bg-dark-surface text-slate-200 rounded-xl rounded-bl-sm px-4 py-3 border border-dark-border'
        }>
          {isUser
            ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            : msg.streaming && !msg.content
              ? <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Javob tayyorlanmoqda...</div>
              : <div>
                  <MessageContent content={msg.content} />
                  {msg.streaming && <span className="inline-block w-1.5 h-4 bg-brand-400 animate-pulse ml-0.5 align-middle rounded-sm" />}
                </div>
          }
        </div>
        {!isUser && !msg.streaming && msg.content && (
          <div className="flex items-center gap-1.5 px-1">
            <button onClick={() => onCopy(msg.content)} className="p-1 text-slate-600 hover:text-slate-400 rounded transition-colors" title="Nusxa">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 text-slate-600 hover:text-emerald-400 rounded transition-colors"><ThumbsUp className="w-3.5 h-3.5" /></button>
            <button className="p-1 text-slate-600 hover:text-red-400 rounded transition-colors"><ThumbsDown className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const SUGGESTIONS = [
  { icon: Bot, text: "Python bilan oddiy chatbot qanday yaratiladi?", label: "Boshlash" },
  { icon: Code2, text: "Groq API dan qanday foydalanaman? Kod misoli bering.", label: "Groq API" },
  { icon: BookOpen, text: "LangChain nima va uning asosiy komponentlari?", label: "LangChain" },
  { icon: HelpCircle, text: "RAG tizimini qanday quraman? Step by step tushuntiring.", label: "RAG" },
];

const MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Eng yangi va kuchli)' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Tez)' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  { value: 'llama-3.2-3b-preview', label: 'Llama 3.2 3B (Yengil)' },
];

const WELCOME = {
  role: 'assistant',
  content: `Salom! Men **ChatBot Edu** AI yordamchisiman 🤖

Men sizga quyidagilarda yordam bera olaman:
- 🤖 Chatbot yaratish (Python, JS, va boshqalar)
- 💻 Kod yozish va tushuntirish
- 📚 LangChain, RAG, Groq API
- 🚀 Deploy va production

Qanday yordam kerak?`,
  id: 'welcome',
  streaming: false,
};

export default function ChatPage() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const msgText = (text ?? input).trim();
    if (!msgText || loading) return;

    setInput('');
    const aiMsgId = `ai_${Date.now()}`;

    // Add user + empty AI message
    setMessages(prev => [
      ...prev,
      { role: 'user', content: msgText, id: `u_${Date.now()}`, streaming: false },
      { role: 'assistant', content: '', id: aiMsgId, streaming: true },
    ]);
    setLoading(true);

    // Build clean history for API — only role+content, no extra fields
    const cleanHistory = messages
      .filter(m => m.id !== 'welcome' || m.content.trim()) // include welcome
      .map(m => ({ role: m.role, content: m.content }))
      .filter(m => m.content.trim()); // skip empty

    const payload = {
      messages: [...cleanHistory, { role: 'user', content: msgText }],
      model,
    };

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              fullText += delta;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: fullText } : m
              ));
            }
          } catch {
            // skip malformed line
          }
        }
      }

      // Finalize
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, content: fullText || '(Javob bo\'sh keldi)', streaming: false } : m
      ));
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: 'Bekor qilindi.', streaming: false } : m
        ));
        return;
      }
      console.error('Chat error:', err);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: `❌ Xatolik: ${err.message}\n\n💡 **GROQ_API_KEY** ni \`.env.local\` faylda tekshiring.`, streaming: false }
          : m
      ));
    } finally {
      setLoading(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, messages, model]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Nusxalandi!');
  };

  const clearChat = () => {
    if (loading) { abortRef.current?.abort(); setLoading(false); }
    setMessages([WELCOME]);
    setInput('');
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-dark-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-dark-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold">AI Yordamchi</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs">Online — Groq AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={model} onChange={e => setModel(e.target.value)}
            className="bg-dark-surface border border-dark-border text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500">
            {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={clearChat} className="p-2 text-slate-500 hover:text-white hover:bg-dark-surface rounded-xl transition-colors" title="Tozalash">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} onCopy={copyText} />
          ))}
        </AnimatePresence>

        {/* Suggestions */}
        {showSuggestions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-4">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s.text)}
                className="flex items-start gap-3 p-4 bg-dark-card border border-dark-border hover:border-brand-500/50 hover:bg-brand-500/5 rounded-xl text-left transition-all group">
                <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/20">
                  <s.icon className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-sm group-hover:text-white transition-colors">{s.text}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{s.label}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-dark-border px-4 py-4 bg-dark-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Savolingizni kiriting... (Shift+Enter yangi qator)"
              rows={1}
              disabled={loading}
              className="w-full bg-dark-surface border border-dark-border text-slate-200 placeholder-slate-600 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-brand-500 resize-none transition-all disabled:opacity-50"
              style={{ minHeight: '52px', maxHeight: '160px' }}
            />
          </div>
          <button
            onClick={() => loading ? abortRef.current?.abort() : sendMessage()}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0 ${loading ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-500 hover:opacity-90 '} disabled:opacity-40`}
            disabled={!loading && !input.trim()}
            title={loading ? 'Bekor qilish' : 'Yuborish'}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-slate-700 text-xs text-center mt-2">
          Groq AI tomonidan quvvatlanadi • Xatolar bo'lishi mumkin, muhim ma'lumotlarni tekshiring
        </p>
      </div>
    </div>
  );
}