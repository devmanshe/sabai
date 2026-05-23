"use client";

import { useEffect } from "react";

type ToastVariant = "info" | "success" | "warning" | "error";

interface AppToastProps {
  open: boolean;
  title: string;
  message: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  autoHideMs?: number;
}

export default function AppToast({
  open,
  title,
  message,
  variant = "info",
  actionLabel,
  onAction,
  onClose,
  autoHideMs = 5000
}: AppToastProps) {
  useEffect(() => {
    if (!open || autoHideMs <= 0) return;
    const timer = window.setTimeout(() => onClose(), autoHideMs);
    return () => window.clearTimeout(timer);
  }, [autoHideMs, onClose, open]);

  if (!open) return null;

  return (
    <div className={`app-toast app-toast--${variant}`} role="status" aria-live="polite">
      <div className="app-toast__body">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      <div className="app-toast__actions">
        {actionLabel && onAction && (
          <button type="button" className="app-toast__primary" onClick={onAction}>
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          className="app-toast__close"
          onClick={onClose}
          aria-label="Tutup notifikasi"
        >
          x
        </button>
      </div>
    </div>
  );
}
