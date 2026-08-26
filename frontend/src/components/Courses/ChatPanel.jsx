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
  ChevronDown,
  Bot,
  HelpCircle,
  Lightbulb,
  Zap,
  Flame,
  Minus,
  MessageSquarePlus,
  Play,
  CheckCircle2,
  Code
} from 'lucide-react';
import api from '../../api/axios';

const SUGGESTIONS = [
  { text: 'Summarize key points from this lecture', icon: Sparkles },
  { text: 'Generate 3 practice quiz questions', icon: HelpCircle },
  { text: 'Explain this concept with a simple analogy', icon: Lightbulb },
  { text: 'Show real-world practical code examples', icon: Zap },
];

// Helper to render inline markdown (bold, italic, inline code, timestamps)
const renderInlineTokens = (str, onTimestampClick) => {
  if (!str) return null;

  // 1. Process timestamps like [02:30] or [1:45:00]
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
        className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 text-[11px] font-mono font-bold rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
        title={`Seek video to ${timeStr}`}
      >
        <Play className="w-2.5 h-2.5 fill-current" />
        <span>{timeStr}</span>
      </button>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.map((part, pIdx) => {
    if (typeof part !== 'string') return part;

    // 2. Process bold **text**, code `text`, and italic *text* or _text_
    const subParts = part.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|_[^_]+_)/g);
    return subParts.map((sub, sIdx) => {
      if (sub.startsWith('**') && sub.endsWith('**')) {
        return (
          <strong key={`${pIdx}-${sIdx}`} className="font-bold text-slate-900 dark:text-white">
            {sub.slice(2, -2)}
          </strong>
        );
      }
      if (sub.startsWith('`') && sub.endsWith('`')) {
        return (
          <code
            key={`${pIdx}-${sIdx}`}
            className="px-1.5 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-300 font-mono border border-slate-200 dark:border-zinc-700 font-semibold"
          >
            {sub.slice(1, -1)}
          </code>
        );
      }
      if ((sub.startsWith('*') && sub.endsWith('*')) || (sub.startsWith('_') && sub.endsWith('_'))) {
        return (
          <em key={`${pIdx}-${sIdx}`} className="italic text-slate-700 dark:text-zinc-300">
            {sub.slice(1, -1)}
          </em>
        );
      }
      return sub;
    });
  });
};

// Code Block Component with Copy Support
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 text-slate-100 text-xs shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
          <Code className="w-3 h-3" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-[11px] leading-relaxed text-emerald-300 dark:text-emerald-400 scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Comprehensive Markdown & Question Renderer
const RenderMarkdown = ({ text, onTimestampClick }) => {
  if (!text) return null;

  // Split into code block chunks and text chunks
  const tokens = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    tokens.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-800 dark:text-zinc-200">
      {tokens.map((token, tIdx) => {
        if (token.type === 'code') {
          return <CodeBlock key={tIdx} code={token.content} language={token.language} />;
        }

        const lines = token.content.split('\n');
        return (
          <div key={tIdx} className="space-y-1.5">
            {lines.map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={i} className="h-0.5" />;

              // Horizontal rule (--- or *** or ___)
              if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
                return <hr key={i} className="my-2.5 border-t border-slate-200 dark:border-zinc-800" />;
              }

              // Headers (#, ##, ###)
              const h1Match = trimmed.match(/^#\s+(.*)/);
              if (h1Match) {
                return (
                  <h3 key={i} className="text-sm font-black text-slate-900 dark:text-white pt-2 pb-0.5 tracking-tight border-b border-slate-200 dark:border-zinc-800">
                    {renderInlineTokens(h1Match[1], onTimestampClick)}
                  </h3>
                );
              }

              const h2Match = trimmed.match(/^##\s+(.*)/);
              if (h2Match) {
                return (
                  <div key={i} className="pt-2.5 pb-1 flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-amber-500 rounded-full inline-block shrink-0" />
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {renderInlineTokens(h2Match[1], onTimestampClick)}
                    </h4>
                  </div>
                );
              }

              const h3Match = trimmed.match(/^###\s+(.*)/);
              if (h3Match) {
                return (
                  <h5 key={i} className="text-xs font-bold text-amber-600 dark:text-amber-400 pt-1.5 pb-0.5">
                    {renderInlineTokens(h3Match[1], onTimestampClick)}
                  </h5>
                );
              }

              // Correct Answer / Answer Callout
              if (/^(\u2713\s*|\u2705\s*)?(Correct Answer|Answer):/i.test(trimmed)) {
                return (
                  <div key={i} className="my-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-start gap-2 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex-1">
                      {renderInlineTokens(trimmed, onTimestampClick)}
                    </div>
                  </div>
                );
              }

              // Multiple Choice Option (A. / B. / C. / D. / A) / (A))
              const optionMatch = trimmed.match(/^([A-D])[\.\)]\s+(.*)/i);
              if (optionMatch) {
                const optLetter = optionMatch[1].toUpperCase();
                const optText = optionMatch[2];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 my-1 p-2 rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800/70 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all shadow-2xs"
                  >
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                      {optLetter}
                    </span>
                    <div className="flex-1 text-xs text-slate-800 dark:text-zinc-200 leading-snug">
                      {renderInlineTokens(optText, onTimestampClick)}
                    </div>
                  </div>
                );
              }

              // Numbered list
              const numList = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
              if (numList) {
                return (
                  <div key={i} className="flex gap-2 items-start pl-1 my-0.5">
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0 w-4 font-mono text-[11px]">
                      {numList[1]}.
                    </span>
                    <div className="flex-1">{renderInlineTokens(numList[2], onTimestampClick)}</div>
                  </div>
                );
              }

              // Bullet list
              const bullet = trimmed.match(/^[-•*]\s+(.*)/);
              if (bullet) {
                return (
                  <div key={i} className="flex gap-2 items-start pl-1 my-0.5">
                    <span className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 font-bold text-sm leading-none">
                      •
                    </span>
                    <div className="flex-1">{renderInlineTokens(bullet[1], onTimestampClick)}</div>
                  </div>
                );
              }

              // Blockquote (> quote)
              const bqMatch = trimmed.match(/^>\s+(.*)/);
              if (bqMatch) {
                return (
                  <div key={i} className="pl-3 py-1 my-1.5 border-l-2 border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 rounded-r-xl text-slate-700 dark:text-zinc-300 italic text-[11px]">
                    {renderInlineTokens(bqMatch[1], onTimestampClick)}
                  </div>
                );
              }

              // Normal text paragraph
              return <p key={i} className="leading-relaxed">{renderInlineTokens(line, onTimestampClick)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

const TypingWave = () => (
  <div className="flex items-center gap-1.5 py-1 px-1">
    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }} />
    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.8s' }} />
    <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.8s' }} />
    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 ml-1">Analyzing lesson context...</span>
  </div>
);

export default function ChatPanel({ courseId, courseStatus, onTimestampClick, onInsertToNotes }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your dedicated AI Tutor for this course. Ask me any question, request key summaries, or ask for timestamped deep-dives.",
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

  // Ready if not generating
  const isReady = !courseStatus || courseStatus === 'completed' || courseStatus === 'ready';

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

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
          ? 'Course is still synthesizing. Please wait a moment until processing finishes.'
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
      {/* Floating Launcher Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2.5 px-4.5 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            open
              ? 'bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-xl'
              : 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-black font-extrabold shadow-lg shadow-amber-500/30'
          }`}
          title={open ? 'Close AI Tutor' : 'Open AI Tutor'}
        >
          {open ? (
            <>
              <X className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
              <span className="text-xs font-bold">Close Tutor</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black animate-pulse" />
              <span className="text-xs font-black tracking-wide">Ask AI Tutor</span>
              {unread > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce shadow-md">
                  {unread}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Window */}
      {open && (
        <div
          className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 backdrop-blur-2xl animate-in slide-in-from-bottom-5 fade-in duration-200"
          style={{
            width: 'min(420px, calc(100vw - 2rem))',
            height: 'min(580px, calc(100vh - 7rem))',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800/90 bg-slate-50/95 dark:bg-zinc-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Adhyaya AI Tutor
                  </h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Grounded in Course Curriculum & Videos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                title="Clear conversation"
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Stream Area */}
          <div
            data-lenis-prevent
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin bg-slate-50/40 dark:bg-zinc-950 overscroll-contain touch-pan-y"
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}

                  <div className={`space-y-1.5 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-amber-500/15 border border-amber-500/35 text-slate-900 dark:text-white rounded-tr-sm font-medium'
                          : 'bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 text-slate-800 dark:text-zinc-200 rounded-tl-sm'
                      }`}
                    >
                      {msg.typing ? (
                        <TypingWave />
                      ) : isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <>
                          <RenderMarkdown text={msg.content} onTimestampClick={onTimestampClick} />
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-3.5 pt-2.5 border-t border-slate-200 dark:border-zinc-800/80 flex flex-wrap gap-1.5 items-center">
                              <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
                                <BookOpen className="w-3 h-3" /> Grounding:
                              </span>
                              {msg.sources.map((s, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[9px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 font-semibold"
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
                      <div className="flex items-center gap-3 pl-1 pt-0.5">
                        <button
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-medium"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>

                        {onInsertToNotes && (
                          <button
                            onClick={() => handleInsertNotes(msg.content, idx)}
                            className="text-[10px] text-slate-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer font-medium"
                          >
                            {insertedIndex === idx ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <PlusCircle className="w-3 h-3" />
                            )}
                            <span>{insertedIndex === idx ? 'Saved to Notes' : 'Add to Notes'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick suggestions */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest font-bold pl-1">
                  Suggested Inquiries
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTIONS.map((s, idx) => {
                    const SIcon = s.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendMessage(s.text)}
                        className="w-full text-left p-3 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/90 hover:border-amber-500/40 hover:bg-amber-500/5 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:text-amber-700 dark:hover:text-amber-300 text-xs transition-all flex items-center justify-between group cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <SIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-medium">{s.text}</span>
                        </div>
                        <span className="text-slate-400 dark:text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all font-bold">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3.5 border-t border-slate-200 dark:border-zinc-800/90 bg-slate-50/90 dark:bg-zinc-900/60 shrink-0">
            <div className="flex items-end gap-2 p-2 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 shadow-sm transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about this course..."
                rows={1}
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 resize-none outline-none max-h-24 py-1 px-1.5 font-normal leading-relaxed"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  input.trim() && !loading
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-sm hover:opacity-90 active:scale-95'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-zinc-500 text-center mt-1.5 font-medium">
              Press Enter ↵ to send • Shift+Enter for new line • Grounded in lessons
            </p>
          </div>
        </div>
      )}
    </>
  );
}