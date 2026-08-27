import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Bell,
  Megaphone,
  User,
  MoreHorizontal,
  ThumbsUp,
  CreditCard,
  LogOut,
} from 'lucide-react';

export type NavScreen = 'login' | 'caixa' | 'avisos' | 'dashboard' | 'indica_apt' | 'perfil' | 'ocorrencias';

interface MobileBottomNavProps {
  activeScreen: NavScreen;
  isAdmin: boolean;
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
}

export default function MobileBottomNav({ activeScreen, isAdmin, onNavigate }: MobileBottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryItems: { screen: NavScreen; label: string; icon: React.FC<{ className?: string }>; accent: string }[] = [
    { screen: 'dashboard', label: 'Início', icon: Home, accent: 'text-[#8C7364]' },
    { screen: 'avisos', label: 'Avisos', icon: Bell, accent: 'text-amber-600' },
    { screen: 'ocorrencias', label: 'Ocorrências', icon: Megaphone, accent: 'text-orange-600' },
    { screen: 'perfil', label: 'Perfil', icon: User, accent: 'text-slate-600' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F6]/95 backdrop-blur-md border-t border-[#EAE3D5] py-1 grid grid-cols-5 items-center md:hidden shadow-lg safe-bottom">
        {primaryItems.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen, 'none')}
              className={`flex flex-col items-center gap-0.5 py-1.5 w-full cursor-pointer min-h-[44px] ${
                isActive ? item.accent : 'text-[#6E6157] hover:text-[#8C7364]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsMoreOpen(v => !v)}
          className={`flex flex-col items-center gap-0.5 py-1.5 w-full cursor-pointer min-h-[44px] ${
            isMoreOpen || activeScreen === 'indica_apt' || activeScreen === 'caixa'
              ? 'text-[#8C7364]'
              : 'text-[#6E6157] hover:text-[#8C7364]'
          }`}
          aria-label="Mais opções"
          aria-expanded={isMoreOpen}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-bold">Mais</span>
        </button>
      </nav>

      <AnimatePresence>
        {isMoreOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setIsMoreOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-[60px] right-4 z-50 bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl shadow-2xl overflow-hidden md:hidden w-56"
            >
              <div className="p-1.5 flex flex-col gap-0.5">
                <button
                  onClick={() => { setIsMoreOpen(false); onNavigate('indica_apt', 'none'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#3E342F] hover:bg-[#F5F2EB] rounded-xl cursor-pointer"
                >
                  <ThumbsUp className="w-4 h-4 text-violet-600" />
                  <span>IndicaApt</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => { setIsMoreOpen(false); onNavigate('caixa', 'push'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#3E342F] hover:bg-[#F5F2EB] rounded-xl cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Caixa do Prédio</span>
                  </button>
                )}

                <div className="h-[1px] bg-[#EAE3D5] my-1" />

                <button
                  onClick={() => { setIsMoreOpen(false); onNavigate('login', 'none'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Portal</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
