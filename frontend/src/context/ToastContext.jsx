import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let globalToastHandler = null;

export const showGlobalToast = (options) => {
  if (globalToastHandler) {
    globalToastHandler(options);
  }
};

const ToastItem = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [remaining, setRemaining] = useState(toast.duration || 5000);

  useEffect(() => {
    if (isPaused) return;

    const start = Date.now();
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, remaining);

    return () => {
      clearTimeout(timer);
      setRemaining((prev) => Math.max(0, prev - (Date.now() - start)));
    };
  }, [isPaused, remaining, toast.id, onDismiss]);

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    error: 'border-red-500/30 hover:border-red-500/50 shadow-red-950/40',
    success: 'border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-950/40',
    warning: 'border-amber-500/30 hover:border-amber-500/50 shadow-amber-950/40',
    info: 'border-blue-500/30 hover:border-blue-500/50 shadow-blue-950/40',
  };

  const bgGlows = {
    error: 'bg-red-500/10 text-red-400',
    success: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    info: 'bg-blue-500/10 text-blue-400',
  };

  const progressColors = {
    error: 'bg-gradient-to-r from-red-600 to-red-400',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-400',
    info: 'bg-gradient-to-r from-blue-600 to-blue-400',
  };

  const type = toast.type || 'error';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-950/95 backdrop-blur-xl border ${borders[type]} p-4 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in group`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${bgGlows[type]} shrink-0 shadow-inner`}>
          {icons[type]}
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            {toast.title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice')}
          </h4>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed break-words font-normal">
            {toast.message}
          </p>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors shrink-0 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 5-Second Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900 overflow-hidden">
        <div
          className={`h-full ${progressColors[type]}`}
          style={{
            animation: `shrinkWidth ${toast.duration || 5000}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'error', title, message, duration = 5000 }) => {
    if (!message) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }]);
  }, []);

  useEffect(() => {
    globalToastHandler = addToast;
    return () => {
      globalToastHandler = null;
    };
  }, [addToast]);

  const toast = {
    error: (message, title = 'Error Occurred', duration = 5000) => {
      addToast({ type: 'error', title, message, duration });
    },
    success: (message, title = 'Success', duration = 5000) => {
      addToast({ type: 'success', title, message, duration });
    },
    warning: (message, title = 'Warning', duration = 5000) => {
      addToast({ type: 'warning', title, message, duration });
    },
    info: (message, title = 'Information', duration = 5000) => {
      addToast({ type: 'info', title, message, duration });
    },
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Stacking Container (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        error: (msg, title) => showGlobalToast({ type: 'error', title, message: msg }),
        success: (msg, title) => showGlobalToast({ type: 'success', title, message: msg }),
        warning: (msg, title) => showGlobalToast({ type: 'warning', title, message: msg }),
        info: (msg, title) => showGlobalToast({ type: 'info', title, message: msg }),
      },
    };
  }
  return context;
};
