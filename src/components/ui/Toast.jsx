import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: toast.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            animation: 'fade-in 0.3s ease',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
