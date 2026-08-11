import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  toast: string | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-[#3E342F] text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 bg-[#8C7364] rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#CBBFB7] uppercase tracking-wider">IndicaApt</p>
            <p className="text-xs font-extrabold mt-0.5">{toast}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar notificação"
            className="p-1 text-[#CBBFB7] hover:text-white rounded-lg shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
