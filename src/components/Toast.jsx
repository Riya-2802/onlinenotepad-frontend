import React, { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({
  toast: () => {}
});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const toast = ({ type = 'success', message, duration = 3000 }) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    setItems((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, duration);
  };

  const value = useMemo(() => ({ toast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3">
        {items.map((t) => (
          <div
            key={t.id}
            className={
              'min-w-[260px] max-w-[320px] rounded-2xl shadow-3d px-4 py-3 border bg-white/80 backdrop-blur ' +
              (t.type === 'error' ? 'border-rose-200' : t.type === 'success' ? 'border-emerald-200' : 'border-sky-200')
            }
          >
            <div className="text-xs text-slate-500">{t.type === 'error' ? 'Error' : t.type === 'success' ? 'Success' : 'Info'}</div>
            <div className="text-sm font-medium mt-0.5">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

