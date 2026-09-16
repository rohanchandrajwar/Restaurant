import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 bg-stone-800 text-white px-5 py-3 rounded-xl shadow-lg">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="text-stone-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
