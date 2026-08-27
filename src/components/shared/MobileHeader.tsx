import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronDown,
  User,
} from 'lucide-react';

export type NavScreen = 'login' | 'caixa' | 'avisos' | 'dashboard' | 'indica_apt' | 'perfil' | 'ocorrencias';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  userProfile: {
    fullName: string;
    apartmentNumber: string;
    avatar: string;
    role: string;
  };
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
  showBack?: boolean;
}

export default function MobileHeader({ title, subtitle, userProfile, onNavigate, showBack = true }: MobileHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const firstName = (userProfile.fullName || '').split(' ')[0] || 'Morador';

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#EAE3D5] px-4 py-4 flex items-center justify-between md:px-8">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => onNavigate('dashboard', 'none')}
            className="p-2 -ml-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors md:hidden cursor-pointer"
            aria-label="Voltar ao início"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase hidden sm:block">
            {subtitle}
          </span>
          <h1 className="text-xl font-extrabold text-[#3E342F] tracking-tight font-display">
            {title}
          </h1>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsProfileOpen(v => !v)}
          className="flex items-center gap-2 py-1 pl-1 pr-1 md:pr-2 hover:bg-[#F5F2EB] rounded-full transition-colors cursor-pointer"
          aria-label="Abrir menu do perfil"
          aria-expanded={isProfileOpen}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#8C7364] shadow-sm bg-[#F5F2EB] flex items-center justify-center shrink-0">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-5 h-5 text-[#8C7364]" />
            )}
          </div>
          <div className="hidden md:block text-left min-w-0">
            <p className="text-[11px] font-extrabold text-[#3E342F] leading-tight truncate">Olá, {firstName}</p>
            <p className="text-[10px] text-[#8C7364] font-semibold leading-tight truncate mt-0.5">{userProfile.apartmentNumber}</p>
          </div>
          <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-[#A6978A] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="absolute right-0 mt-2 w-64 bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl shadow-2xl overflow-hidden z-40"
              >
                <div className="px-4 py-4 flex items-center gap-3 border-b border-[#EAE3D5]">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-[#8C7364] bg-[#F5F2EB] shrink-0">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt={userProfile.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5 text-[#8C7364] mx-auto mt-2.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-[#3E342F] truncate">{userProfile.fullName}</p>
                    <p className="text-[10px] text-[#8C7364] font-semibold truncate">{userProfile.apartmentNumber}</p>
                  </div>
                </div>
                <div className="p-1.5 flex flex-col gap-0.5">
                  <button onClick={() => { setIsProfileOpen(false); onNavigate('perfil', 'none'); }} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer">Meu perfil</button>
                  <button onClick={() => { setIsProfileOpen(false); onNavigate('indica_apt', 'none'); }} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer">IndicaApt</button>
                  <div className="h-[1px] bg-[#EAE3D5] my-1" />
                  <button onClick={() => { setIsProfileOpen(false); onNavigate('login', 'none'); }} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer">Sair do Portal</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
