"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Simple event bus for toasts
const listeners: ((toast: Toast) => void)[] = [];

export function toast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { id, message, type };
  listeners.forEach((l) => l(newToast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (newToast: Toast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };
    listeners.push(handler);
    return () => {
      const index = listeners.indexOf(handler);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-in-down flex items-center gap-3 p-4 rounded-xl bg-surface-dark border border-white/10 shadow-xl text-white pointer-events-auto backdrop-blur-md bg-opacity-90"
        >
          <span className={`material-symbols-outlined ${
            t.type === 'success' ? 'text-green-500' : 
            t.type === 'error' ? 'text-red-500' : 'text-blue-500'
          }`}>
            {t.type === 'success' ? 'check_circle' : 
             t.type === 'error' ? 'error' : 'info'}
          </span>
          <p className="text-sm font-medium">{t.message}</p>
        </div>
      ))}
    </div>,
    document.body
  );
}
