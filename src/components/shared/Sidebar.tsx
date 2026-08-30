import React from 'react';
import {
  Building2,
  Home,
  FileText,
  Megaphone,
  ThumbsUp,
  User,
  CreditCard,
  LogOut,
} from 'lucide-react';
import InstallPWAButton from './InstallPWAButton';

export type NavScreen = 'login' | 'caixa' | 'avisos' | 'dashboard' | 'indica_apt' | 'perfil' | 'ocorrencias';

interface SidebarProps {
  activeScreen: NavScreen;
  isAdmin: boolean;
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
  brand?: string;
}

const NAV_ITEMS: { screen: NavScreen; label: string; icon: React.FC<{ className?: string }>; adminOnly?: boolean; accent?: string }[] = [
  { screen: 'dashboard', label: 'Início', icon: Home, accent: 'bg-[#8C7364]' },
  { screen: 'avisos', label: 'Avisos', icon: FileText, accent: 'bg-amber-600' },
  { screen: 'ocorrencias', label: 'Ocorrências', icon: Megaphone, accent: 'bg-orange-600' },
  { screen: 'indica_apt', label: 'IndicaApt', icon: ThumbsUp, accent: 'bg-[#A480CF]' },
  { screen: 'perfil', label: 'Perfil', icon: User, accent: 'bg-slate-600' },
  { screen: 'caixa', label: 'Caixa do Prédio', icon: CreditCard, adminOnly: true, accent: 'bg-emerald-600' },
];

export default function Sidebar({ activeScreen, isAdmin, onNavigate, brand = 'Oslo Portal' }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-[#F5F2EB] border-r border-[#EAE3D5] hidden md:flex flex-col p-6">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-[#8C7364] text-white rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl text-[#3E342F] tracking-tight font-display">{brand}</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.screen;
          const accent = item.accent || 'bg-[#8C7364]';
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen, isActive ? 'none' : 'none')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left ${
                isActive
                  ? `${accent} text-white`
                  : 'text-[#3E342F] hover:bg-[#EAE3D5]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8C7364]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#EAE3D5] pt-4 mt-auto space-y-0.5">
        <InstallPWAButton />
        <button
          onClick={() => onNavigate('login', 'none')}
          className="w-full px-4 py-2 text-left text-xs font-bold uppercase text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair do Portal</span>
        </button>
      </div>
    </aside>
  );
}
