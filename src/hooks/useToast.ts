import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, duration: number = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, duration }]);

    // 自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration + 300); // 加上动画时间
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

