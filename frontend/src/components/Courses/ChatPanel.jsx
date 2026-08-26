import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  PlusCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import api from '../../api/axios';

const SUGGESTIONS = [
  'Summarize the key concepts in this section',
  'What are 3 practical questions I should practice?',
  'Explain this concept in simple terms',
  'How is this used in real-world software engineering?',
];

const RenderMarkdown = ({ text, onTimestampClick }) => {
  if (!text) return null;

  const lines = text.split('\n');

  const renderInline = (str) => {
    // Match timestamps like [02:30] or [1:45:00]
    const timestampRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = timestampRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const timeStr = match[1];
      parts.push(
        <button
          key={`ts-${match.index}`}
          onClick={() => {
            if (onTimestampClick) {
              const segs = timeStr.split(':').map(Number);
              let totalSecs = 0;
              if (segs.length === 3) totalSecs = segs[0] * 3600 + segs[1] * 60 + segs[2];
              else if (segs.length === 2) totalSecs = segs[0] * 60 + segs[1];
              onTimestampClick(totalSecs);
            }
          }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
        >
          <Clock className="w-2.5 h-2.5" />
          {timeStr}
        </button>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.map((part, pIdx) => {
      if (typeof part !== 'string') return part;
      // Handle bold **text** and code `text`
      const subParts = part.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      return subParts.map((sub, sIdx) => {
        if (sub.startsWith('**') && sub.endsWith('**')) {
          return <strong key={`${pIdx}-${sIdx}`} className="font-semibold text-slate-900 dark:text-zinc-100">{sub.slice(2, -2)}</strong>;
        }
        if (sub.startsWith('`') && sub.endsWith('`')) {
          return (
            <code key={`${pIdx}-${sIdx}`} className="px-1 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 font-mono border border-slate-200 dark:border-zinc-700">
              {sub.slice(1, -1)}
            </code>
          );
        }
        return sub;
      });
    });
  };

  return (
    <div className="space-y-1.5 text-xs leading-relaxed text-slate-800 dark:text-zinc-200">
      {lines.map((line, i) => {
        const numList = line.match(/^(\d+)\.\s+(.*)/);
        if (numList) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0 w-4">{numList[1]}.</span>
              <div className="flex-1">{renderInline(numList[2])}</div>
            </div>
          );
        }

        const bullet = line.match(/^[-•*]\s+(.*)/);
        if (bullet) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 font-bold">•</span>
              <div className="flex-1">{renderInline(bullet[1])}</div>
            </div>
          );
        }

        return line.trim() ? (
          <p key={i}>{renderInline(line)}</p>
        ) : (
          <div key={i} className="h-1" />
        );
      })}
    </div>
  );
};

const TypingDots = () => (
  <span className="inline-flex items-center gap-1 px-1 py-0.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
      />
    ))}
  </span>
);

export default function ChatPanel({ courseId, courseStatus, onTimestampClick, onInsertToNotes }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your dedicated AI Tutor for this course. Ask me any question, request a summary, or ask for timestamped deep-dives.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [insertedIndex, setInsertedIndex] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isReady = courseStatus === 'completed';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setUnread(0);
    }
  }, [open]);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsertNotes = (text, idx) => {
    if (onInsertToNotes) {
      onInsertToNotes(text);
      setInsertedIndex(idx);
      setTimeout(() => setInsertedIndex(null), 2000);
    }
  };

  const sendMessage = useCallback(async (text) => {
    const question = (text || input).trim();
    if (!question || loading || !isReady) return;

    setInput('');

    const userMsg = { role: 'user', content: question };
    const typingMsg = { role: 'assistant', content: '', typing: true };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => !m.typing)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post(`/courses/${courseId}/chat`, {
        question,
        history,
      });

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
        },
      ]);

      if (!open) setUnread((c) => c + 1);
    } catch (err) {
      const errMsg =
        err.response?.status === 400
          ? 'Course is still generating. Please wait a moment until processing finishes.'
          : 'Encountered an issue retrieving tutor answers. Please try again.';
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: errMsg, sources: [] },
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
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! How can I assist your study session today?",
        sources: [],
      },
    ]);
    setInput('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          open
            ? 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 shadow-lg'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-amber-500/25'
        }`}
        title={open ? 'Close AI Tutor' : 'Open AI Tutor'}
      >
        {open ? (
          <>
            <X className="w-4 h-4" />
            <span className="text-xs font-bold">Close Tutor</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold">Ask AI Tutor</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Floating Window */}
      <div
        className={`fixed bottom-22 right-6 z-40 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 origin-bottom-right border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 backdrop-blur-xl ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          width: 'min(420px, calc(100vw - 2rem))',
          height: 'min(580px, calc(100vh - 120px))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                AI Learning Tutor
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">
                {isReady ? 'Context-grounded in this course' : 'Waiting for course generation…'}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            title="Clear conversation"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-white dark:bg-zinc-950">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                <div className="space-y-1.5 max-w-[85%]">
                  <div
                    className={`p-3.5 rounded-2xl text-xs shadow-sm ${
                      isUser
                        ? 'bg-amber-500/15 border border-amber-500/35 text-slate-900 dark:text-zinc-100 rounded-tr-sm'
                        : 'bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.typing ? (
                      <TypingDots />
                    ) : isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <>
                        <RenderMarkdown text={msg.content} onTimestampClick={onTimestampClick} />
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex flex-wrap gap-1 items-center">
                            <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-semibold uppercase tracking-wider flex items-center gap-1 mr-1">
                              <BookOpen className="w-2.5 h-2.5" /> Grounding:
                            </span>
                            {msg.sources.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!isUser && !msg.typing && (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copiedIndex === idx ? 'Copied' : 'Copy'}
                      </button>

                      {onInsertToNotes && (
                        <button
                          onClick={() => handleInsertNotes(msg.content, idx)}
                          className="text-[10px] text-slate-500 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {insertedIndex === idx ? <Check className="w-3 h-3 text-green-500" /> : <PlusCircle className="w-3 h-3" />}
                          {insertedIndex === idx ? 'Added to notes' : 'Add to notes'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Quick suggestions */}
          {messages.length === 1 && isReady && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-semibold pl-1">
                Suggested Prompts
              </p>
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 hover:border-amber-500/40 hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <span>{s}</span>
                  <span className="text-slate-400 dark:text-zinc-600 group-hover:text-amber-500 transition-colors font-bold">→</span>
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60">
          <div className="flex items-end gap-2 p-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 focus-within:border-amber-500/60 shadow-sm transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about the lecture..."
              rows={1}
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 resize-none outline-none max-h-24 py-1"
              disabled={loading || !isReady}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || !isReady}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                input.trim() && !loading
                  ? 'bg-amber-500 text-black hover:bg-amber-400 font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[9px] text-slate-500 dark:text-zinc-500 text-center mt-1.5">
            Answers are generated from course transcripts and curriculum modules.
          </p>
        </div>
      </div>
    </>
  );
}