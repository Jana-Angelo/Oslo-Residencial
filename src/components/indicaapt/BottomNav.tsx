import { Home, Bell, Megaphone, Sparkles, User, LogOut } from 'lucide-react';
import { NavScreen } from './shared';

interface BottomNavProps {
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
}

export default function BottomNav({ onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F6]/95 backdrop-blur-md border-t border-[#EAE3D5] py-1 grid grid-cols-6 items-center md:hidden shadow-lg safe-bottom">
      <button
        onClick={() => onNavigate('dashboard', 'none')}
        className="flex flex-col items-center gap-0.5 py-1 text-[#6E6157] hover:text-[#8C7364] w-full cursor-pointer"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">Início</span>
      </button>

      <button
        onClick={() => onNavigate('avisos', 'none')}
        className="flex flex-col items-center gap-0.5 py-1 text-[#6E6157] hover:text-[#8C7364] w-full cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        <span className="text-[10px] font-bold">Avisos</span>
      </button>

      <button
        onClick={() => onNavigate('ocorrencias', 'none')}
        className="flex flex-col items-center gap-0.5 py-1 text-[#6E6157] hover:text-[#8C7364] w-full cursor-pointer"
      >
        <Megaphone className="w-5 h-5" />
        <span className="text-[10px] font-bold">Ocorrências</span>
      </button>

      <button
        onClick={() => onNavigate('indica_apt', 'none')}
        className="flex flex-col items-center gap-0.5 py-1 text-[#8C7364] w-full cursor-pointer"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] font-bold">IndicaApt</span>
      </button>

      <button
        onClick={() => onNavigate('perfil', 'none')}
        className="flex flex-col items-center gap-0.5 py-1 text-[#6E6157] hover:text-[#8C7364] w-full cursor-pointer"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold">Perfil</span>
      </button>

      <button
        onClick={() => onNavigate('login', 'none')}
        className="flex flex-col items-center gap-0.5 py-1 text-red-600 hover:text-red-700 cursor-pointer w-full"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-bold">Sair</span>
      </button>
    </nav>
  );
}
