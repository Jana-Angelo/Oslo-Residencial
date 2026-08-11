import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  deleteConfirmId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ deleteConfirmId, onCancel, onConfirm }: DeleteModalProps) {
  if (!deleteConfirmId) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Excluir indicação">
      <div onClick={onCancel} className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4"
      >
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-extrabold text-base text-[#3E342F] font-display">Excluir esta indicação?</h3>
          <p className="text-xs text-[#6E6157] leading-relaxed">
            Essa ação não poderá ser desfeita.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-[#F5F2EB] hover:bg-[#EAE3D5] active:bg-[#E0D8CB] text-[#8C7364] font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </div>
  );
}
