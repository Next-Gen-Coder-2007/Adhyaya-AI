import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import api from '../../api/axios';

// ── Typing animation dots ─────────────────────────────────────────────────────
const TypingDots = () => (
  <span className="inline-flex items-center gap-1 px-1">
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
      />
    ))}
  </span>
);

// ── Individual message bubble ─────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mb-0.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
          isUser
            ? 'bg-amber-500/15 border border-amber-500/25 text-zinc-200 rounded-br-sm'
            : 'bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 rounded-bl-sm'
        }`}
      >
        {msg.typing ? <TypingDots /> : msg.content}
      </div>
    </div>
  );
};

// ── Suggested prompts shown at start ─────────────────────────────────────────
const SUGGESTIONS = [
  'Summarise the first module',
  'What are the key takeaways?',
  'Explain the hardest concept',
  'Give me a quick quiz question',
];

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatPanel({ courseId, courseStatus }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI tutor for this course. Ask me anything about the material — I'll pull answers straight from the content.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isReady = courseStatus === 'completed';

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnread(0);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const question = (text || input).trim();
    if (!question || loading || !isReady) return;

    setInput('');

    const userMsg = { role: 'user', content: question };
    const typingMsg = { role: 'assistant', content: '', typing: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => !m.typing)
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await api.post(`/courses/${courseId}/chat`, {
        question,
        history,
      });

      setMessages(prev => [
        ...prev.slice(0, -1), // remove typing indicator
        { role: 'assistant', content: data.answer },
      ]);

      if (!open) setUnread(c => c + 1);
    } catch (err) {
      const errMsg = err.response?.status === 400
        ? 'The course is still being processed. Please wait a moment.'
        : 'Something went wrong. Please try again.';
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: errMsg },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, courseId, open, isReady]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! What would you like to know about the course?",
    }]);
    setInput('');
  };

  const showSuggestions = messages.length === 1;

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: open
            ? 'rgba(39,39,42,0.95)'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          border: open ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}
        title={open ? 'Close tutor' : 'Ask the AI tutor'}
      >
        {open ? (
          <>
            <X className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-400 pr-0.5">Close</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-zinc-900" />
            <span className="text-xs font-bold text-zinc-900">AI Tutor</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat panel ── */}
      <div
        className={`fixed bottom-20 right-6 z-40 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          width: '340px',
          height: '500px',
          background: 'rgba(18,18,20,0.97)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200 leading-none">AI Tutor</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
                {isReady ? 'Course-aware · always on' : 'Waiting for course to finish…'}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            title="Clear chat"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {/* Suggested prompts (only at start) */}
          {showSuggestions && isReady && (
            <div className="pt-1 space-y-1.5">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium pl-8">Try asking</p>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="ml-8 block text-left text-[11px] text-zinc-400 hover:text-amber-400 transition-colors py-1 border-b border-zinc-800/60 w-[calc(100%-2rem)] last:border-0"
                >
                  {s} →
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-3 py-3 border-t border-white/5">
          {!isReady ? (
            <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-pulse" />
              Course is still generating…
            </div>
          ) : (
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2 transition-colors"
              style={{ background: 'rgba(39,39,42,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the course…"
                rows={1}
                className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 resize-none outline-none leading-relaxed max-h-24"
                style={{ scrollbarWidth: 'none' }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-30"
                style={{
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'rgba(63,63,70,0.5)',
                }}
              >
                <Send className="w-3.5 h-3.5 text-zinc-900" />
              </button>
            </div>
          )}
          <p className="text-[9px] text-zinc-700 text-center mt-1.5">
            Answers are based on this course's content only
          </p>
        </div>
      </div>
    </>
  );
}