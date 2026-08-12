import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  ArrowLeft,
  Home,
  Plus,
  Bell,
  ChevronDown,
  X,
} from 'lucide-react';
import { Recommendation, UserProfile } from '../../types';
import { Avatar, formatRelativeTime, NavScreen } from './shared';

interface HeaderProps {
  userProfile: UserProfile;
  firstName: string;
  visibleRecs: Recommendation[];
  hasNotifications?: boolean;
  isNotificationsOpen: boolean;
  isProfileOpen: boolean;
  isMobileMenuOpen: boolean;
  onToggleNotifications: () => void;
  onToggleProfile: () => void;
  onToggleMobileMenu: () => void;
  onCloseProfile: () => void;
  onCloseNotifications: () => void;
  onShowMine: () => void;
  onFocusComposer: () => void;
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
}

export default function Header({
  userProfile,
  firstName,
  visibleRecs,
  hasNotifications,
  isNotificationsOpen,
  isProfileOpen,
  isMobileMenuOpen,
  onToggleNotifications,
  onToggleProfile,
  onToggleMobileMenu,
  onCloseProfile,
  onCloseNotifications,
  onShowMine,
  onFocusComposer,
  onNavigate,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#EAE3D5] px-4 py-3 flex items-center justify-between gap-3 md:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors md:hidden cursor-pointer"
          title="Menu"
          aria-label="Abrir menu de navegação"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu className="w-6 h-6" />
        </button>
        <button
          onClick={() => onNavigate('dashboard', 'none')}
          className="p-2 -ml-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors md:hidden cursor-pointer"
          title="Voltar"
          aria-label="Voltar para o início"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => onNavigate('dashboard', 'none')}
          className="p-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors md:hidden cursor-pointer"
        >
          <Home className="w-6 h-6" />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase hidden md:block">
            Comunidade Oslo
          </span>
          <h1 className="text-2xl font-semibold text-[#3E342F] tracking-tight font-display truncate">
            IndicaApt
          </h1>
          <p className="text-xs text-[#8C7364] font-medium hidden md:block">
            O que seus vizinhos recomendam para você.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
        {/* Main CTA */}
        <button
          onClick={onFocusComposer}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#7A5B47] text-white rounded-[10px] text-xs font-bold hover:bg-[#6D503E] active:bg-[#5C4334] transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Fazer uma indicação</span>
          <span className="sm:hidden">Indicar</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={onToggleNotifications}
            className="p-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-full transition-colors relative cursor-pointer"
            title="Notificações"
            aria-label="Abrir notificacões"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center border border-[#FBF9F6]">
              2
            </span>
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="absolute right-0 mt-2 w-80 bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#EAE3D5] flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#3E342F] uppercase tracking-wider">Notificações</h4>
                  <span className="text-[9px] font-bold text-[#8C7364] uppercase">Novas indicações</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[...visibleRecs].slice(0, 5).map(r => (
                    <div key={r.id} className="px-4 py-3 border-b border-[#F5F2EB] last:border-0 hover:bg-[#F5F2EB]/50 transition-colors">
                      <p className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">
                        Nova indicação de {r.apartment}
                      </p>
                      <p className="text-xs font-extrabold text-[#3E342F] mt-0.5">{r.providerName}</p>
                      <p className="text-xs text-[#6E6157] leading-relaxed mt-0.5 line-clamp-2">{r.comment}</p>
                      <p className="text-[10px] text-[#A6978A] font-semibold mt-1">{formatRelativeTime(r.createdAt)}</p>
                    </div>
                  ))}
                  {visibleRecs.length === 0 && (
                    <p className="px-4 py-6 text-center text-xs text-[#A6978A]">Nenhuma notificação ainda.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile avatar + greeting */}
        <div className="relative">
          <button
            onClick={onToggleProfile}
            className="flex items-center gap-2 py-1 pl-1 pr-1 md:pr-2 hover:bg-[#F5F2EB] rounded-full transition-colors cursor-pointer"
            aria-label="Abrir menu do perfil"
            aria-expanded={isProfileOpen}
          >
            <Avatar
              name={userProfile.fullName}
              apartment={userProfile.apartmentNumber}
              src={userProfile.avatar}
              className="w-9 h-9 text-sm shrink-0 border border-[#EAE3D5]"
            />
            <div className="hidden md:block text-left min-w-0">
              <p className="text-[11px] font-extrabold text-[#3E342F] leading-tight truncate">
                Olá, {firstName}
              </p>
              <p className="text-[10px] text-[#8C7364] font-semibold leading-tight truncate mt-0.5">
                {userProfile.apartmentNumber ? (String(userProfile.apartmentNumber).toLowerCase().includes('apto') ? String(userProfile.apartmentNumber) : `Apto ${userProfile.apartmentNumber}`) : 'Morador'}
              </p>
            </div>
            <ChevronDown className={`hidden md:block w-3.5 h-3.5 text-[#A6978A] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={onCloseProfile} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-64 bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl shadow-2xl overflow-hidden z-40"
                >
                  <div className="px-4 py-4 flex items-center gap-3 border-b border-[#EAE3D5]">
                    <Avatar
                      name={userProfile.fullName}
                      apartment={userProfile.apartmentNumber}
                      src={userProfile.avatar}
                      className="w-11 h-11 text-base shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-[#3E342F] truncate">{userProfile.fullName}</p>
                      <p className="text-[10px] text-[#8C7364] font-semibold truncate">{userProfile.apartmentNumber}</p>
                    </div>
                  </div>
                  <div className="p-1.5 flex flex-col gap-0.5">
                    <button
                      onClick={() => { onCloseProfile(); onNavigate('perfil', 'none'); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer"
                    >
                      Meu perfil
                    </button>
                    <button
                      onClick={() => { onShowMine(); onCloseProfile(); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer"
                    >
                      Minhas indicações
                    </button>
                    <div className="h-[1px] bg-[#EAE3D5] my-1" />
                    <button
                      onClick={() => { onCloseProfile(); onNavigate('login', 'none'); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Sair do Portal
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
