'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Toast 提示组件
 *
 * 用法：
 *   const { toast } = useToast();
 *   toast('保存成功');
 */

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = React.createContext<{
  toast: (message: string, type?: ToastType) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast 容器 */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium shadow-lg',
              'backdrop-blur-xl',
              'animate-[slideDown_0.3s_ease-out]',
              t.type === 'success' &&
                'bg-brand/90 text-white',
              t.type === 'error' &&
                'bg-red-500/90 text-white',
              t.type === 'info' &&
                'bg-black/70 text-white',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
