import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Bell, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Wrench, 
  ChevronRight, 
  User, 
  Menu, 
  X, 
  Settings,
  Home,
  FileText,
  ThumbsUp,
  CreditCard,
  LogOut,
  Pencil,
  Phone,
  Upload,
  Megaphone,
} from 'lucide-react';
import { Notice } from '../types';
import { syndicProfileService } from '../lib/database';
import { storageService } from '../lib/storage';
import { supabase } from '../lib/supabaseClient';

interface DashboardScreenProps {
  userProfile: {
    fullName: string;
    apartmentNumber: string;
    avatar: string;
    role: string;
    isAdmin?: boolean;
  };
  onNavigate: (screen: 'login' | 'caixa' | 'avisos' | 'ocorrencias' | 'dashboard' | 'indica_apt' | 'perfil', transition: 'none' | 'push') => void;
  notices: Notice[];
  syndicData: { name: string; period: string; quote: string; avatar: string };
  syndicWhatsapp: string;
  onUpdateSyndic: (data: { name: string; period: string; quote: string; avatar: string }) => void;
  onUpdateWhatsapp: (num: string) => void;
}

export default function DashboardScreen({ userProfile, onNavigate, notices, syndicData, syndicWhatsapp, onUpdateSyndic, onUpdateWhatsapp }: DashboardScreenProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [syndic, setSyndic] = useState(syndicData);
  const [whatsapp, setWhatsapp] = useState(syndicWhatsapp);

  React.useEffect(() => {
    setSyndic(syndicData);
  }, [syndicData]);

  React.useEffect(() => {
    setWhatsapp(syndicWhatsapp);
  }, [syndicWhatsapp]);

  // Modal States
  const [isSyndicEditOpen, setIsSyndicEditOpen] = useState(false);
  const [isWhatsappConfigOpen, setIsWhatsappConfigOpen] = useState(false);

  // Form states for Syndic Edit
  const [editName, setEditName] = useState(syndic.name);
  const [editPeriod, setEditPeriod] = useState(syndic.period);
  const [editQuote, setEditQuote] = useState(syndic.quote);
  const [editAvatar, setEditAvatar] = useState(syndic.avatar);

  // Form state for WhatsApp Config
  const [editWhatsapp, setEditWhatsapp] = useState(whatsapp);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return;
        const url = await storageService.uploadAvatar(userId, file);
        if (url) {
          setEditAvatar(url);
        }
      } catch (err) {
        console.error('Erro ao fazer upload do avatar do síndico:', err);
      }
    }
  };

  const saveSyndicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      name: editName,
      period: editPeriod,
      quote: editQuote,
      avatar: editAvatar
    };
    setSyndic(updated);
    onUpdateSyndic(updated);
    setIsSyndicEditOpen(false);

    try {
      const existing = await syndicProfileService.get();
      if (existing) {
        await syndicProfileService.update(existing.id, {
          name: editName,
          period: editPeriod,
          quote: editQuote,
          avatar_url: editAvatar || null,
          whatsapp: whatsapp || null,
        });
      } else {
        await syndicProfileService.create({
          name: editName,
          period: editPeriod,
          quote: editQuote,
          avatar_url: editAvatar || null,
          whatsapp: whatsapp || null,
        });
      }
    } catch (e) {
      console.error('Erro ao salvar perfil do síndico no Supabase:', e);
    }
  };

  const saveWhatsappConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsapp(editWhatsapp);
    onUpdateWhatsapp(editWhatsapp);
    setIsWhatsappConfigOpen(false);

    try {
      const existing = await syndicProfileService.get();
      if (existing) {
        await syndicProfileService.update(existing.id, {
          whatsapp: editWhatsapp || null,
        });
      } else {
        await syndicProfileService.create({
          name: syndic.name,
          period: syndic.period,
          quote: syndic.quote,
          avatar_url: syndic.avatar || null,
          whatsapp: editWhatsapp || null,
        });
      }
    } catch (e) {
      console.error('Erro ao salvar WhatsApp no Supabase:', e);
    }
  };

  const getSanitizedWhatsappUrl = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    return `https://wa.me/${cleanNum}`;
  };

  const isAdmin = userProfile.isAdmin !== false && (userProfile.role === 'Administrador' || userProfile.role === 'Síndico' || userProfile.isAdmin === true);

  // Filter 2 recent notices for display
  const recentNotices = notices.slice(0, 2);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Manutenção': return <Wrench className="w-5 h-5" />;
      case 'Reuniões': return <Calendar className="w-5 h-5" />;
      case 'Segurança': return <ShieldCheck className="w-5 h-5" />;
      case 'Social': return <Sparkles className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  // Count notices published today
  const todayNoticesCount = notices.filter(notice => {
    const timeLower = (notice.time || '').toLowerCase();
    const dateLower = (notice.date || '').toLowerCase();
    return timeLower.includes('hoje') || 
           timeLower.includes('agora mesmo') || 
           dateLower.includes('hoje') ||
           dateLower.includes('agora mesmo');
  }).length;

  const formattedCount = String(todayNoticesCount).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col pb-20 md:pb-0 md:pl-64">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#EAE3D5] px-4 py-4 flex items-center justify-between md:px-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#8C7364]" />
            <span className="font-bold text-lg text-[#3E342F] tracking-tight font-display">
              Oslo Residencial
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('avisos', 'push')}
            className="p-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-full transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#FBF9F6]"></span>
          </button>
          <div 
            onClick={() => onNavigate('perfil', 'none')} 
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#8C7364] shadow-sm cursor-pointer flex items-center justify-center bg-[#F5F2EB]"
          >
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
        </div>
      </header>

      {/* Desktop Sidebar (Permanent) */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-[#F5F2EB] border-r border-[#EAE3D5] hidden md:flex flex-col p-6">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-[#8C7364] text-white rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-[#3E342F] tracking-tight font-display">Oslo Portal</span>
        </div>

        {/* User Card */}
        <div className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#8C7364] flex items-center justify-center bg-[#F5F2EB]">
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
          <div className="min-w-0">
            <p className="font-bold text-xs text-[#3E342F] truncate">{userProfile.fullName}</p>
            <p className="text-[10px] text-[#8C7364] font-semibold">{userProfile.apartmentNumber}</p>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 space-y-1.5">
          <button 
            onClick={() => onNavigate('dashboard', 'none')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#8C7364] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Início</span>
          </button>

          <button 
            onClick={() => onNavigate('avisos', 'none')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
          >
            <FileText className="w-4 h-4 text-[#8C7364]" />
            <span>Avisos</span>
          </button>

          <button 
            onClick={() => onNavigate('ocorrencias', 'none')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
          >
            <Megaphone className="w-4 h-4 text-[#8C7364]" />
            <span>Ocorrências</span>
          </button>

          <button 
            onClick={() => onNavigate('indica_apt', 'none')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
          >
            <Sparkles className="w-4 h-4 text-[#8C7364]" />
            <span>IndicaApt</span>
          </button>

          <button 
            onClick={() => onNavigate('perfil', 'none')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
          >
            <User className="w-4 h-4 text-[#8C7364]" />
            <span>Perfil</span>
          </button>

          {/* Quick Admin access / Caixa */}
          {isAdmin && (
            <button 
              onClick={() => onNavigate('caixa', 'push')}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left border border-dashed border-[#CBBFB7] mt-8"
            >
              <CreditCard className="w-4 h-4 text-[#8C7364]" />
              <span>Caixa do Prédio</span>
            </button>
          )}
        </nav>

        <div className="border-t border-[#EAE3D5] pt-4 mt-auto">
          <button 
            onClick={() => onNavigate('login', 'none')}
            className="w-full px-4 py-2 text-left text-xs font-bold uppercase text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#3E342F] tracking-tight font-display">
            Bem-vindo, Residente.
          </h2>
          <p className="text-[#8C7364] font-medium text-sm mt-1">
            Tudo certo com o {userProfile.apartmentNumber === 'Apartment 04' ? 'Apartamento 04' : userProfile.apartmentNumber} hoje?
          </p>
        </div>

        {/* Grid for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Perfil do Síndico Card */}
          <div className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase">
                Perfil do Síndico
              </h3>
              {isAdmin && (
                <button 
                  onClick={() => {
                    setEditName(syndic.name);
                    setEditPeriod(syndic.period);
                    setEditQuote(syndic.quote);
                    setEditAvatar(syndic.avatar);
                    setIsSyndicEditOpen(true);
                  }}
                  className="p-1.5 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                  title="Editar Perfil"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#EAE3D5] shrink-0 bg-[#F5F2EB]">
                <img 
                  src={syndic.avatar} 
                  alt={syndic.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-[#3E342F]">{syndic.name}</h4>
                <p className="text-[11px] text-[#8C7364] font-semibold">{syndic.period}</p>
                <p className="text-xs text-[#6E6157] leading-relaxed italic pt-1">
                  "{syndic.quote}"
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setEditWhatsapp(whatsapp);
                setIsWhatsappConfigOpen(true);
              }}
              className="w-full py-3 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold tracking-wider rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Falar com o Síndico
            </button>
          </div>

          {/* Quick Actions Column */}
          <div className="space-y-4">
            
            {/* Avisos Hoje Card */}
            <div 
              onClick={() => onNavigate('avisos', 'push')}
              className="bg-[#F5EFE6] border border-[#E5DFD5] hover:border-[#8C7364] rounded-2xl p-5 shadow-sm flex items-center justify-between cursor-pointer group transition-all"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase block">
                  Avisos Hoje
                </span>
                {/* Embedded span inside selector to support: //span[contains(text(), 'Avisos')]/.. */}
                <div className="flex items-center gap-1.5 text-xs text-[#8C7364] font-semibold">
                  <Bell className="w-3.5 h-3.5" />
                  <span className="group-hover:underline">Avisos</span>
                </div>
                <p className="text-xs text-[#8C7364] font-medium">
                  Clique para ler as atualizações
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-4xl font-extrabold text-[#8C7364] font-display">
                  {formattedCount}
                </div>
              </div>
            </div>

            {/* IndicaApt Card */}
            <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-[#8C7364]" />
                  {/* Matches selector: //div[contains(text(), 'IndicaApt')]/.. */}
                  <div className="font-extrabold text-sm text-[#3E342F] font-display">
                    IndicaApt
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
              <p className="text-xs text-[#6E6157] leading-relaxed">
                Encontre prestadores recomendados por vizinhos.
              </p>
              <div className="pt-1 flex">
                {/* Matches selector: //div[contains(text(), 'IndicaApt')]/..//a */}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('indica_apt', 'push');
                  }}
                  className="text-xs font-bold text-[#8C7364] hover:text-[#3E342F] flex items-center gap-1 group/link"
                >
                  Explorar serviços
                  <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Quick buttons to satisfy specs: //span[contains(text(), 'Caixa do Prédio')]/.. and //span[contains(text(), 'Avisos')]/.. */}
        <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {isAdmin && (
            <button 
              onClick={() => onNavigate('caixa', 'push')}
              className="flex items-center justify-center gap-3 p-4 bg-[#F5F2EB] hover:bg-[#EAE3D5] border border-[#EAE3D5] rounded-xl text-xs font-bold text-[#3E342F] uppercase tracking-wider cursor-pointer transition-colors"
            >
              <CreditCard className="w-4.5 h-4.5 text-[#8C7364]" />
              <span>Caixa do Prédio</span>
            </button>
          )}

          <button 
            onClick={() => onNavigate('avisos', 'push')}
            className="flex items-center justify-center gap-3 p-4 bg-[#F5F2EB] hover:bg-[#EAE3D5] border border-[#EAE3D5] rounded-xl text-xs font-bold text-[#3E342F] uppercase tracking-wider cursor-pointer transition-colors"
          >
            <Bell className="w-4.5 h-4.5 text-[#8C7364]" />
            <span>Avisos</span>
          </button>
        </div>

        {/* Avisos Recentes Section */}
        <div className="bg-[#F5F2EB]/50 border border-[#EAE3D5] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#3E342F] font-display">
              Avisos Recentes
            </h3>
            <button 
              onClick={() => onNavigate('avisos', 'push')}
              className="text-xs font-bold text-[#8C7364] hover:underline"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <div 
                  key={notice.id} 
                  onClick={() => onNavigate('avisos', 'push')}
                  className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-4 flex gap-4 hover:border-[#8C7364] transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#8C7364]/10 text-[#8C7364] rounded-lg flex items-center justify-center shrink-0">
                    {getCategoryIcon(notice.category)}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-[#3E342F] truncate">
                        {notice.title}
                      </h4>
                      <span className="text-[9px] font-bold text-[#A6978A] shrink-0 uppercase tracking-wider">
                        {notice.time || notice.date}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E6157] truncate">
                      {notice.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-[#A6978A]">
                Nenhum comunicado recente.
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Side Drawer (id='side-drawer') to satisfy spec */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs transition-opacity"
          />
          <div className="absolute inset-y-0 left-0 max-w-full flex">
            <div 
              id="side-drawer"
              className="w-80 bg-[#FBF9F6] border-r border-[#EAE3D5] shadow-2xl flex flex-col"
            >
              <div className="px-5 py-6 border-b border-[#EAE3D5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#8C7364]" />
                  <span className="font-bold text-base text-[#3E342F] font-display">Oslo Drawer</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User overview inside drawer */}
              <div className="p-5 border-b border-[#EAE3D5] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#8C7364] flex items-center justify-center bg-[#F5F2EB]">
                  {userProfile.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt={userProfile.fullName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#8C7364]" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3E342F]">{userProfile.fullName}</h4>
                  <p className="text-xs text-[#8C7364] font-medium">{userProfile.role}</p>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 px-3 py-4 space-y-1">
                <button 
                  onClick={() => { onNavigate('dashboard', 'none'); setIsDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#8C7364] bg-[#F5F2EB] rounded-xl uppercase tracking-wider"
                >
                  <Home className="w-4 h-4" />
                  <span>Início</span>
                </button>

                <button 
                  onClick={() => { onNavigate('avisos', 'none'); setIsDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#3E342F] hover:bg-[#F5F2EB] rounded-xl uppercase tracking-wider"
                >
                  <FileText className="w-4 h-4 text-[#8C7364]" />
                  <span>Avisos</span>
                </button>

                <button 
                  onClick={() => { onNavigate('ocorrencias', 'none'); setIsDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#3E342F] hover:bg-[#F5F2EB] rounded-xl uppercase tracking-wider"
                >
                  <Megaphone className="w-4 h-4 text-[#8C7364]" />
                  <span>Ocorrências</span>
                </button>

                <button 
                  onClick={() => { onNavigate('indica_apt', 'none'); setIsDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#3E342F] hover:bg-[#F5F2EB] rounded-xl uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-[#8C7364]" />
                  <span>IndicaApt</span>
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => { onNavigate('caixa', 'push'); setIsDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#3E342F] hover:bg-[#F5F2EB] rounded-xl uppercase tracking-wider"
                  >
                    <CreditCard className="w-4 h-4 text-[#8C7364]" />
                    <span>Caixa do Prédio</span>
                  </button>
                )}

                {/* Specific selector element: //div[@id='side-drawer']//span[contains(text(), 'Configurações')]/.. */}
                <button 
                  onClick={() => { onNavigate('perfil', 'none'); setIsDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-[#3E342F] hover:bg-[#F5F2EB] rounded-xl uppercase tracking-wider"
                >
                  <Settings className="w-4 h-4 text-[#8C7364]" />
                  <span>Configurações</span>
                </button>
              </div>

              <div className="p-4 border-t border-[#EAE3D5]">
                <button 
                  onClick={() => { onNavigate('login', 'none'); setIsDrawerOpen(false); }}
                  className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Sair do Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Footer for Mobile screens (Dashboard/Resident contexts) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F6]/95 backdrop-blur-md border-t border-[#EAE3D5] py-1 grid grid-cols-6 items-center md:hidden shadow-lg safe-bottom">
        <button 
          onClick={() => onNavigate('dashboard', 'none')}
          className="flex flex-col items-center gap-0.5 py-1 text-[#8C7364] w-full cursor-pointer"
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
          className="flex flex-col items-center gap-0.5 py-1 text-[#6E6157] hover:text-[#8C7364] w-full cursor-pointer"
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

      {/* Modal: Editar Perfil do Síndico */}
      {isSyndicEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
              <h3 className="font-extrabold text-base text-[#3E342F] font-display">
                Editar Perfil do Síndico
              </h3>
              <button 
                onClick={() => setIsSyndicEditOpen(false)}
                className="p-1 text-[#A6978A] hover:text-[#3E342F] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveSyndicProfile} className="space-y-4">
              {/* Avatar Selector and File Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">Foto do Síndico</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EAE3D5] bg-[#F5F2EB] shrink-0">
                    <img 
                      src={editAvatar} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-bold text-[#8C7364] hover:bg-[#F5F2EB] cursor-pointer shadow-sm transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Fazer Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          className="hidden" 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditAvatar('/images/syndic_roberto.jpg')}
                        className="px-2.5 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-medium text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer"
                      >
                        Padrão
                      </button>
                    </div>
                    <p className="text-[10px] text-[#A6978A]">Recomendado: imagem quadrada. Formatos JPG ou PNG.</p>
                  </div>
                </div>

              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">Nome do Síndico</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do Síndico"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
              </div>

              {/* Period */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">Período de Gestão</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Gestão 2023-2025"
                  value={editPeriod}
                  onChange={(e) => setEditPeriod(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
              </div>

              {/* Quote / Phrase */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">Frase / Compromisso</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Mensagem do síndico para os moradores..."
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSyndicEditOpen(false)}
                  className="flex-1 py-2.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Falar com o Síndico (WhatsApp Config & Chat) */}
      {isWhatsappConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
              <h3 className="font-extrabold text-base text-[#3E342F] font-display flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#8C7364]" />
                Falar com o Síndico
              </h3>
              <button 
                onClick={() => setIsWhatsappConfigOpen(false)}
                className="p-1 text-[#A6978A] hover:text-[#3E342F] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {whatsapp ? (
                <div className="bg-[#EAF5EC] border border-[#C6E6CD] p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#25D366]/10 text-[#128C7E] rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#128C7E] uppercase tracking-wider">Número de WhatsApp</h4>
                      <p className="text-sm font-semibold text-[#1F2937]">{whatsapp}</p>
                    </div>
                  </div>
                  
                  <a
                    href={getSanitizedWhatsappUrl(whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold tracking-wider rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors text-center"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Enviar Mensagem no WhatsApp
                  </a>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-1">
                  <p className="text-xs font-semibold text-amber-800">
                    Nenhum número de WhatsApp cadastrado.
                  </p>
                  {isAdmin ? (
                    <p className="text-[11px] text-amber-700">
                      Cadastre o número abaixo para que os 14 apartamentos possam entrar em contato direto.
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-700">
                      O síndico ainda não cadastrou o número de contato. Por favor, tente novamente mais tarde ou verifique os comunicados.
                    </p>
                  )}
                </div>
              )}

              {isAdmin ? (
                <form onSubmit={saveWhatsappConfig} className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">
                      {whatsapp ? 'Atualizar Número do WhatsApp' : 'Cadastrar Número do WhatsApp'}
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: 5511999999999 (Código do país + DDD + Número)"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                    />
                    <p className="text-[10px] text-[#A6978A] leading-normal pt-1">
                      * Digite o número completo contendo o código do país (55 para Brasil), o DDD e o número do celular. Não inclua espaços, parênteses ou traços.
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2 border-t border-[#EAE3D5] mt-4">
                    <button
                      type="button"
                      onClick={() => setIsWhatsappConfigOpen(false)}
                      className="flex-1 py-2.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                    >
                      Salvar Número
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-end pt-2 mt-4 border-t border-[#EAE3D5]">
                  <button
                    type="button"
                    onClick={() => setIsWhatsappConfigOpen(false)}
                    className="px-6 py-2.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
