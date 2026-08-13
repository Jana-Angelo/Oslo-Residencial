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
import { NavScreen } from './shared';

interface SidebarProps {
  isAdmin: boolean;
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
}

export default function Sidebar({ isAdmin, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-16 xl:w-60 bg-[#F5F2EB] border-r border-[#EAE3D5] hidden md:flex flex-col p-3 xl:p-6">
      <div className="flex items-center justify-center xl:justify-start gap-2.5 mb-8">
        <div className="w-9 h-9 bg-[#8C7364] text-white rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <span className="hidden xl:block font-bold text-xl text-[#3E342F] tracking-tight font-display whitespace-nowrap">Oslo Portal</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        <button
          onClick={() => onNavigate('dashboard', 'none')}
          title="Início"
          aria-label="Início"
          className="w-full flex items-center justify-center xl:justify-start gap-3 px-0 xl:px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 text-[#8C7364] shrink-0" />
          <span className="hidden xl:block">Início</span>
        </button>

        <button
          onClick={() => onNavigate('avisos', 'none')}
          title="Avisos"
          aria-label="Avisos"
          className="w-full flex items-center justify-center xl:justify-start gap-3 px-0 xl:px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#8C7364] shrink-0" />
          <span className="hidden xl:block">Avisos</span>
        </button>

        <button
          onClick={() => onNavigate('ocorrencias', 'none')}
          title="Ocorrências"
          aria-label="Ocorrências"
          className="w-full flex items-center justify-center xl:justify-start gap-3 px-0 xl:px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
        >
          <Megaphone className="w-4 h-4 text-[#8C7364] shrink-0" />
          <span className="hidden xl:block">Ocorrências</span>
        </button>

        <button
          onClick={() => onNavigate('indica_apt', 'none')}
          title="IndicaApt"
          aria-label="IndicaApt"
          className="w-full flex items-center justify-center xl:justify-start gap-3 px-0 xl:px-4 py-3 bg-[#8C7364] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
        >
          <ThumbsUp className="w-4 h-4 shrink-0" />
          <span className="hidden xl:block">IndicaApt</span>
        </button>

        <button
          onClick={() => onNavigate('perfil', 'none')}
          title="Perfil"
          aria-label="Perfil"
          className="w-full flex items-center justify-center xl:justify-start gap-3 px-0 xl:px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
        >
          <User className="w-4 h-4 text-[#8C7364] shrink-0" />
          <span className="hidden xl:block">Perfil</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate('caixa', 'push')}
            title="Caixa do Prédio"
            aria-label="Caixa do Prédio"
            className="w-full flex items-center justify-center xl:justify-start gap-3 px-0 xl:px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[#8C7364] shrink-0" />
            <span className="hidden xl:block">Caixa do Prédio</span>
          </button>
        )}
      </nav>

      <div className="border-t border-[#EAE3D5] pt-4 mt-auto">
        <button
          onClick={() => onNavigate('login', 'none')}
          title="Sair do Portal"
          aria-label="Sair do Portal"
          className="w-full flex items-center justify-center xl:justify-start gap-2 px-0 xl:px-4 py-2 text-left text-xs font-bold uppercase text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden xl:block">Sair do Portal</span>
        </button>
      </div>
    </aside>
  );
}
