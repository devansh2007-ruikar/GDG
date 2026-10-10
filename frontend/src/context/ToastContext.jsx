import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const lastToastRef = React.useRef({ message: '', time: 0 });

  const addToast = useCallback((message, type = 'info') => {
    if (!message) return;
    const now = Date.now();
    if (lastToastRef.current.message === message && (now - lastToastRef.current.time) < 1200) {
      return;
    }
    lastToastRef.current = { message, time: now };

    const id = `${now}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => {
      if (prev.some((t) => t.message === message && t.type === type)) {
        return prev;
      }
      return [...prev, { id, message, type }];
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  React.useEffect(() => {
    const handleServerWaking = (e) => {
      const msg = e.detail?.message || 'Waking up the server...';
      info(msg);
    };
    window.addEventListener('app:server-waking', handleServerWaking);
    return () => window.removeEventListener('app:server-waking', handleServerWaking);
  }, [info]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`} onClick={() => removeToast(toast.id)}>
            <span>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <div style={{ flex: 1 }}>{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
