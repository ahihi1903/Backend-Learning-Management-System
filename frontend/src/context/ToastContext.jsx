import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircleIcon, CheckIcon, CloseIcon } from "../components/Icons.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((message, options = {}) => {
    const id = ++nextId.current;
    const toast = { id, message, type: options.type || "success" };
    setToasts((items) => [...items.slice(-2), toast]);
    window.setTimeout(() => dismiss(id), options.duration || 4000);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ pushToast, dismiss }), [pushToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-label="Thông báo" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.type}`} key={toast.id} role={toast.type === "error" ? "alert" : "status"}>
            <span className="toast-icon" aria-hidden="true">
              {toast.type === "error" ? <AlertCircleIcon size={18} /> : <CheckIcon size={18} />}
            </span>
            <p>{toast.message}</p>
            <button type="button" aria-label="Đóng thông báo" onClick={() => dismiss(toast.id)}><CloseIcon size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
