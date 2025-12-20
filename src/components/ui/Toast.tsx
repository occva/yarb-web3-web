import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import './Toast.css';

export interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 触发显示动画
    setVisible(true);

    // 设置自动关闭定时器
    const timer = setTimeout(() => {
      setVisible(false);
      // 等待动画完成后调用 onClose
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  return (
    <div className={`toast ${visible ? 'show' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">
          <Check size={20} />
        </span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;

