import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  X,
  Home,
  FileText,
  Megaphone,
  Sparkles,
  User,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { NavScreen } from './shared';

interface MobileDrawerProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
}

export default function MobileDrawer({ isOpen, isAdmin, onClose, onNavigate }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#3E342F]/40 md:hidden"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="fixed inset-y-0 left-0 z-50 w-60 bg-[#F5F2EB] border-r border-[#EAE3D5] md:hidden flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#8C7364] text-white rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl text-[#3E342F] tracking-tight font-display">Oslo Portal</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-[#8C7364] hover:bg-[#EAE3D5] rounded-lg transition-colors cursor-pointer"
                title="Fechar"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5">
              <button
                onClick={() => { onClose(); onNavigate('dashboard', 'none'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#8C7364]" />
                <span>Início</span>
              </button>

              <button
                onClick={() => { onClose(); onNavigate('avisos', 'none'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#8C7364]" />
                <span>Avisos</span>
              </button>

              <button
                onClick={() => { onClose(); onNavigate('ocorrencias', 'none'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left cursor-pointer"
              >
                <Megaphone className="w-4 h-4 text-[#8C7364]" />
                <span>Ocorrências</span>
              </button>

              <button
                onClick={() => { onClose(); onNavigate('indica_apt', 'none'); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#8C7364] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>IndicaApt</span>
              </button>

              <button
                onClick={() => { onClose(); onNavigate('perfil', 'none'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left cursor-pointer"
              >
                <User className="w-4 h-4 text-[#8C7364]" />
                <span>Perfil</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => { onClose(); onNavigate('caixa', 'push'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[#8C7364]" />
                  <span>Caixa do Prédio</span>
                </button>
              )}
            </nav>

            <div className="border-t border-[#EAE3D5] pt-4">
              <button
                onClick={() => { onClose(); onNavigate('login', 'none'); }}
                className="w-full px-4 py-2 text-left text-xs font-bold uppercase text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do Portal</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
