"use client";

import { useEffect, useState } from "react";

export interface ToastData {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastData[];
  removeToast: (id: string) => void;
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onRemove, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icon =
    toast.type === "success" ? (
      <svg className="w-5 h-5 text-sage shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : toast.type === "error" ? (
      <svg className="w-5 h-5 text-blush shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-terracotta shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    );

  const bg =
    toast.type === "success"
      ? "bg-sage/10 border-sage/30"
      : toast.type === "error"
      ? "bg-blush/10 border-blush/30"
      : "bg-terracotta/10 border-terracotta/30";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300 ${
        visible && !exiting
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8"
      }`}
    >
      {icon}
      <p className="text-sm text-warm-text font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => { setExiting(true); setTimeout(onRemove, 300); }}
        className="text-warm-muted hover:text-warm-text transition shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[10000] flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
