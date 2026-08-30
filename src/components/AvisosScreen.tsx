import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Wrench,
  Users,
  ShieldAlert,
  Sparkles,
  Bell,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import { Notice, UserProfile } from '../types';
import { LinkifiedText } from '../lib/linkify';
import { Sidebar, MobileBottomNav, MobileHeader } from './shared';
import { overlayPanel, overlayScrim } from './shared/motion';

interface AvisosScreenProps {
  userProfile: UserProfile;
  notices: Notice[];
  onAddNotice: (notice: Notice) => void;
  onEditNotice?: (notice: Notice) => void;
  onDeleteNotice?: (id: string) => void;
  isAdmin?: boolean;
  onNavigate: (screen: 'login' | 'caixa' | 'avisos' | 'ocorrencias' | 'dashboard' | 'indica_apt' | 'perfil', transition: 'none' | 'push') => void;
}

export default function AvisosScreen({ 
  userProfile,
  notices, 
  onAddNotice, 
  onEditNotice, 
  onDeleteNotice, 
  isAdmin = false, 
  onNavigate 
}: AvisosScreenProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for new notice
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<string>('Manutenção');
  const [customCategory, setCustomCategory] = useState('');
  const [newAuthor, setNewAuthor] = useState('Morador do Oslo');
  const [isCritical, setIsCritical] = useState(false);

  const defaultCategories = ['Todos', 'Manutenção', 'Reuniões', 'Social', 'Segurança'];
  const categories = [
    ...defaultCategories,
    ...Array.from(new Set(notices.map(n => n.category)))
      .filter(cat => !defaultCategories.includes(cat))
  ];

  const filteredNotices = notices.filter(n => {
    const matchesCategory = activeCategory === 'Todos' || n.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.author && n.author.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleEditClick = (notice: Notice) => {
    setEditingNotice(notice);
    setNewTitle(notice.title);
    setNewDesc(notice.description);
    
    const standardCategories = ['Manutenção', 'Reuniões', 'Social', 'Segurança'];
    if (standardCategories.includes(notice.category)) {
      setNewCat(notice.category);
      setCustomCategory('');
    } else {
      setNewCat('Outros');
      setCustomCategory(notice.category);
    }
    
    setNewAuthor(notice.author);
    setIsCritical(!!notice.isCritical);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
    setNewTitle('');
    setNewDesc('');
    setNewCat('Manutenção');
    setCustomCategory('');
    setIsCritical(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const finalCategory = newCat === 'Outros' ? (customCategory.trim() || 'Outros') : newCat;

    if (editingNotice) {
      const updated: Notice = {
         ...editingNotice,
        category: finalCategory,
        categoryLabel: finalCategory === 'Manutenção' ? 'MANUTENÇÃO CRÍTICA' : finalCategory.toUpperCase(),
        title: newTitle,
        description: newDesc,
        author: newAuthor,
        isCritical: isCritical,
      };
      onEditNotice?.(updated);
    } else {
      const notice: Notice = {
        id: `notice-${Date.now()}`,
        category: finalCategory,
        categoryLabel: finalCategory === 'Manutenção' ? 'MANUTENÇÃO CRÍTICA' : finalCategory.toUpperCase(),
        title: newTitle,
        description: newDesc,
        date: 'Hoje',
        time: 'Agora mesmo',
        author: newAuthor,
        authorRole: isAdmin ? 'Síndico' : 'Morador Voluntário',
        isCritical: isCritical,
      };
      onAddNotice(notice);
    }

    handleCloseModal();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Manutenção': return <Wrench className="w-5 h-5" />;
      case 'Reuniões': return <Users className="w-5 h-5" />;
      case 'Segurança': return <ShieldAlert className="w-5 h-5" />;
      case 'Social': return <Sparkles className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col pb-20 md:pb-0 md:pl-64">
      
      <Sidebar activeScreen="avisos" isAdmin={isAdmin} onNavigate={onNavigate} />
      <MobileHeader
        title="Avisos"
        subtitle="Comunicados"
        userProfile={userProfile}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-8 max-w-[960px] mx-auto w-full space-y-4 md:space-y-[18px]">
        
        {/* Action Button: "+ Novo Comunicado" */}
        <div className="flex justify-between items-center">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-1 h-5 bg-amber-400 rounded-full" />
            <p data-onboarding="avisos:contador" className="text-xs text-[#8C7364] font-semibold uppercase tracking-wider">
              {filteredNotices.length} avisos publicados
            </p>
          </div>
          {isAdmin && (
            <button 
              data-onboarding="avisos:novo"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto py-3 px-6 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold tracking-wider rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Comunicado
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F5F2EB]/40 p-2.5 rounded-2xl border border-[#EAE3D5]">
          {/* Scrollable categories */}
          <div data-onboarding="avisos:filtros" className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            {/* Fixed "Todos" button */}
            <button
              onClick={() => setActiveCategory('Todos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeCategory === 'Todos' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm' 
                  : 'bg-[#F5F2EB] text-[#8C7364] hover:bg-[#EAE3D5] border border-transparent'
              }`}
            >
              Todos
            </button>

            {/* Scrollable remaining categories */}
            <div className="flex-1 flex gap-2 overflow-x-auto py-1 scrollbar-none">
              {categories.filter(cat => cat !== 'Todos').map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm' 
                      : 'bg-[#F5F2EB] text-[#8C7364] hover:bg-[#EAE3D5] border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar inside/at the end of the category bar */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6978A]" />
            <input
              data-onboarding="avisos:busca"
              type="text"
              placeholder="Buscar aviso ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A6978A] hover:text-[#3E342F] p-0.5 rounded-full hover:bg-[#F5F2EB] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notices Stack */}
        <div className="space-y-[18px]">
          <AnimatePresence mode="popLayout">
            {filteredNotices.map((notice) => {
              const isExpanded = expandedNoticeId === notice.id;
              
              return (
                <motion.div
                  key={notice.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  data-onboarding={notice.isCritical ? 'avisos:aviso_critico' : undefined}
                  className={`bg-white border-[1px] min-h-[220px] rounded-[18px] overflow-hidden transition-all shadow-[0_8px_30px_rgba(0,0,0,0.05)] ${
                    notice.isCritical
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-[#EAE3D5]'
                  }`}
                >
                  {/* Banner Image if exists */}
                  {notice.image && notice.image !== "" ? (
                    <div className="w-full h-48 overflow-hidden bg-[#F5F2EB] relative">
                      <img 
                        src={notice.image} 
                        alt={notice.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-bold text-[#8C7364] tracking-wider uppercase">
                        Galeria Oslo
                      </div>
                    </div>
                  ) : null}

                  <div className="p-5 space-y-4">
                    {/* Tag + Time */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase ${
                        notice.isCritical 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-[#F5F2EB] text-[#8C7364]'
                      }`}>
                        {notice.categoryLabel}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[#A6978A] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notice.time}
                        </span>
                        {isAdmin && (
                          <div className="flex items-center gap-1 ml-2 border-l border-[#EAE3D5] pl-2">
                            <button
                              data-onboarding="avisos:editar_excluir"
                              onClick={() => handleEditClick(notice)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar Comunicado"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(notice.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Comunicado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-base text-[#3E342F] leading-snug tracking-tight font-display">
                        {notice.title}
                      </h3>
                      <p className="text-xs text-[#6E6157] leading-relaxed whitespace-pre-line">
                        <LinkifiedText text={notice.description} />
                      </p>
                      
                      {/* Accordion Details */}
                      {isExpanded && notice.details && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-3 border-t border-[#F5F2EB] mt-3 text-xs text-[#6E6157] leading-relaxed"
                        >
                          {notice.details}
                        </motion.div>
                      )}
                    </div>

                    {/* Author block & button */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#F5F2EB]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-[#8C7364]/10 rounded-lg flex items-center justify-center text-[#8C7364]">
                          {getCategoryIcon(notice.category)}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-[#3E342F]">{notice.author}</p>
                          <p className="text-[10px] text-[#A6978A] font-semibold">{notice.authorRole || 'Administração'}</p>
                        </div>
                      </div>

                      {/* Detail button if details exist */}
                      {notice.details && (
                        <button 
                          data-onboarding="avisos:ver_detalhes"
                          onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                          className="text-xs font-bold text-[#8C7364] hover:text-[#3E342F] flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? 'Ocultar' : 'Ver Detalhes'}
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredNotices.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#EAE3D5] p-8 space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-[#3E342F] font-display">
                  Nenhum aviso por aqui
                </h3>
                <p className="text-xs text-[#8C7364] leading-relaxed max-w-xs mx-auto">
                  Quando o síndico publicar comunicados, eles aparecerão nesta lista.
                </p>
              </div>
              {isAdmin && (
                <p className="text-[10px] font-semibold text-[#A6978A] tracking-wide uppercase">
                  Você pode criar o primeiro comunicado usando o botão acima.
                </p>
              )}
            </div>
          )}
        </div>

      </main>

      {/* New Notice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayScrim}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={handleCloseModal}
              className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
            />
            <motion.div
              variants={overlayPanel}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4"
            >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
              <h3 className="font-extrabold text-base text-[#3E342F] font-display">
                {editingNotice ? 'Editar Comunicado' : 'Novo Comunicado'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Título do Comunicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reunião do Bloco C"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Categoria</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                >
                  <option value="Manutenção">Manutenção</option>
                  <option value="Reuniões">Reuniões</option>
                  <option value="Social">Social</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {newCat === 'Outros' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Nome da Nova Categoria</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Festas, Avisos Rápidos"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Autor / Seu Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Reis (Apto 14)"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Mensagem</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva as informações detalhadas aqui..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCritical"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="w-4 h-4 text-[#8C7364] border-[#E5DFD5] rounded focus:ring-[#8C7364]"
                />
                <label htmlFor="isCritical" className="text-xs font-semibold text-[#6E6157] cursor-pointer">
                  Marcar como Comunicado Crítico / Urgente
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer transition-colors"
              >
                {editingNotice ? 'Salvar Alterações' : 'Publicar Comunicado'}
              </button>
            </form>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayScrim}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
            />
            <motion.div
              variants={overlayPanel}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4"
            >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-[#3E342F] font-display">Excluir Comunicado?</h3>
              <p className="text-xs text-[#6E6157] leading-relaxed">
                Tem certeza de que deseja excluir este comunicado? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364] font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmId) {
                    onDeleteNotice?.(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeScreen="avisos" isAdmin={isAdmin} onNavigate={onNavigate} />

    </div>
  );
}
