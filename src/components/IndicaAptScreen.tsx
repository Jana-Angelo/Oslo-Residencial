import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Star, 
  Trash2, 
  Edit2, 
  Bell, 
  Home, 
  User, 
  X, 
  Search, 
  Heart,
  Sparkles,
  FileText,
  LogOut,
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Send,
  Megaphone,
  CreditCard,
} from 'lucide-react';
import { Recommendation, UserProfile } from '../types';
import { storageService } from '../lib/storage';

interface IndicaAptScreenProps {
  recommendations: Recommendation[];
  userProfile: UserProfile;
  onAddRecommendation: (rec: Recommendation) => void;
  onEditRecommendation: (rec: Recommendation) => void;
  onDeleteRecommendation: (id: string) => void;
  onNavigate: (screen: 'login' | 'caixa' | 'avisos' | 'ocorrencias' | 'dashboard' | 'indica_apt' | 'perfil', transition: 'none' | 'push') => void;
}

export default function IndicaAptScreen({ 
  recommendations, 
  userProfile,
  onAddRecommendation, 
  onEditRecommendation, 
  onDeleteRecommendation, 
  onNavigate 
}: IndicaAptScreenProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userProfile.isAdmin !== false && (userProfile.role === 'Administrador' || userProfile.role === 'Síndico' || userProfile.isAdmin === true);

  // New recommendation states
  const [providerName, setProviderName] = useState('');
  const [category, setCategory] = useState('MARCENARIA');
  const [customCategory, setCustomCategory] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [commentImages, setCommentImages] = useState<string[]>([]);
  const [commentLink, setCommentLink] = useState('');
  const [commentLinkText, setCommentLinkText] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const categories = ['TODOS', 'MARCENARIA', 'ELÉTRICA', 'PAISAGISMO', 'OUTROS'];

  const handleOpenAdd = () => {
    setEditingRec(null);
    setProviderName('');
    setCategory('MARCENARIA');
    setCustomCategory('');
    setComment('');
    setRating(5);
    setCommentImages([]);
    setCommentLink('');
    setCommentLinkText('');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: Recommendation) => {
    setEditingRec(rec);
    setProviderName(rec.providerName);
    setCustomCategory(rec.category !== 'MARCENARIA' && rec.category !== 'ELÉTRICA' && rec.category !== 'PAISAGISMO' && rec.category !== 'OUTROS' ? rec.category : '');
    setCategory(rec.category === 'MARCENARIA' || rec.category === 'ELÉTRICA' || rec.category === 'PAISAGISMO' || rec.category === 'OUTROS' ? rec.category : 'OUTROS');
    setComment(rec.comment);
    setRating(rec.rating);
    setCommentImages(rec.images || []);
    setCommentLink(rec.link || '');
    setCommentLinkText(rec.linkText || '');
    setIsModalOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCommentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadingImg(true);
    setUploadError('');
    for (const file of Array.from(files) as File[]) {
      try {
        const url = await storageService.uploadRecommendationImage(file);
        setCommentImages(prev => [...prev, url]);
      } catch (err: any) {
        console.error('Erro ao fazer upload da imagem:', err);
        setUploadError(err?.message || 'Falha ao enviar imagem.');
      }
    }
    setUploadingImg(false);
    e.target.value = '';
  };

  const handleRemoveCommentImage = (idx: number) => {
    setCommentImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || !comment) return;

    const finalCategory = category === 'OUTROS' && customCategory.trim() ? customCategory.trim().toUpperCase() : category;

    const authorData = {
      apartment: userProfile.apartmentNumber || 'Seu Apartamento',
      authorName: userProfile.fullName || 'Morador',
      authorAvatar: userProfile.avatar || '',
    };

    if (editingRec) {
      const updated: Recommendation = {
        ...editingRec,
        providerName,
        category: finalCategory,
        comment,
        rating,
        images: commentImages.length > 0 ? commentImages : undefined,
        link: commentLink || undefined,
        linkText: commentLinkText || undefined,
      };
      onEditRecommendation(updated);
    } else {
      const created: Recommendation = {
        id: `rec-${Date.now()}`,
        ...authorData,
        providerName,
        category: finalCategory,
        comment,
        rating,
        images: commentImages.length > 0 ? commentImages : undefined,
        link: commentLink || undefined,
        linkText: commentLinkText || undefined,
        date: 'Postado agora mesmo'
      };
      onAddRecommendation(created);
    }

    setIsModalOpen(false);
  };

  // Filter & Search logic
  const filteredRecs = recommendations.filter(rec => {
    const matchesSearch = rec.providerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeFilter === 'TODOS' || 
                           (activeFilter === 'FAVORITOS' && favorites.has(rec.id)) ||
                           rec.category === activeFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col pb-20 md:pb-0 md:pl-64">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FBF9F6]/90 backdrop-blur-md border-b border-[#EAE3D5] px-4 py-4 flex items-center justify-between md:px-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('dashboard', 'none')}
            className="p-2 -ml-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors md:hidden cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => onNavigate('dashboard', 'none')}
            className="p-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors md:hidden cursor-pointer"
          >
            <Home className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-[#3E342F] tracking-tight font-display">
              IndicaApt
            </h1>
            <p className="text-xs text-[#8C7364] font-medium hidden md:block">
              Recomendações confiáveis compartilhadas por vizinhos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleOpenAdd}
            className="p-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-full cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onNavigate('avisos', 'push')}
            className="p-2 text-[#8C7364] hover:bg-[#F5F2EB] rounded-full relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </button>
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

        <nav className="flex-1 space-y-1.5">
          <button 
            onClick={() => onNavigate('dashboard', 'none')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
          >
            <Home className="w-4 h-4 text-[#8C7364]" />
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
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#8C7364] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
          >
            <Sparkles className="w-4 h-4" />
            <span>IndicaApt</span>
          </button>

          <button 
            onClick={() => onNavigate('perfil', 'none')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
          >
            <User className="w-4 h-4 text-[#8C7364]" />
            <span>Perfil</span>
          </button>

          {isAdmin && (
            <button 
              onClick={() => onNavigate('caixa', 'push')}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#3E342F] hover:bg-[#EAE3D5] rounded-xl font-bold text-xs tracking-wider uppercase transition-all text-left"
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

      {/* Main Content feed */}
      <main className="flex-1 p-4 md:p-8 max-w-[860px] mx-auto w-full space-y-[18px]">
        
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por profissional ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5DFD5] rounded-2xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {/* Favoritos pill with heart icon */}
            <button
              onClick={() => setActiveFilter('FAVORITOS')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'FAVORITOS' 
                  ? 'bg-red-500 text-white shadow-xs' 
                  : 'bg-[#F5F2EB]/70 text-red-400 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-3 h-3 ${activeFilter === 'FAVORITOS' ? 'fill-white' : 'fill-red-400'}`} />
              Favoritos
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  activeFilter === cat 
                    ? 'bg-[#8C7364] text-white shadow-xs' 
                    : 'bg-[#F5F2EB]/70 text-[#8C7364] hover:bg-[#EAE3D5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Cards list */}
        <div className="space-y-[18px]">
          <AnimatePresence mode="popLayout">
            {filteredRecs.map((rec) => {
              const isOwner = rec.apartment === userProfile.apartmentNumber || rec.authorName === userProfile.fullName;
              const isFav = favorites.has(rec.id);

              return (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border-[1px] border-[#EAE3D5] rounded-[18px] overflow-hidden min-h-[220px] shadow-[0_8px_30px_rgba(0,0,0,0.05)] space-y-4"
                >
                  {/* User post header */}
                  <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-[#F5F2EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EAE3D5] bg-[#F5F2EB]">
                        {rec.authorAvatar ? (
                          <img 
                            src={rec.authorAvatar} 
                            alt={rec.apartment}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#8C7364] text-white font-extrabold flex items-center justify-center text-sm font-display shadow-sm">
                            {rec.apartment?.replace('Apartamento ', '') || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-[#3E342F]">
                          {rec.apartment}
                        </h4>
                        <p className="text-[10px] text-[#A6978A] font-semibold">
                          {rec.date}
                        </p>
                      </div>
                    </div>

                    {/* Actions if owner */}
                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteRecommendation(rec.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Content Image (single main image) */}
                  {rec.image && rec.image !== "" ? (
                    <div className="w-full h-64 bg-[#F5F2EB] relative overflow-hidden">
                      <img 
                        src={rec.image} 
                        alt={rec.providerName} 
                        className="w-full h-full object-cover cursor-pointer"
                        referrerPolicy="no-referrer"
                        onClick={() => setLightboxImage(rec.image!)}
                      />
                    </div>
                  ) : null}

                  {/* Text Details & Rating */}
                  <div className="px-5 pb-5 pt-1 space-y-4">
                    
                    <div className="flex items-center justify-between">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= rec.rating ? 'fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Tag */}
                        <span className="px-2.5 py-1 bg-[#F5F2EB] text-[#8C7364] rounded-md text-[9px] font-bold tracking-wider uppercase">
                          {rec.category}
                        </span>

                        {/* Favorite button */}
                        <button
                          onClick={() => handleToggleFavorite(rec.id)}
                          className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-red-50"
                          title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Heart 
                            className={`w-5 h-5 transition-colors ${
                              isFav ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'
                            }`} 
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm text-[#3E342F]">
                        {rec.providerName}
                      </h4>
                      <p className="text-xs text-[#6E6157] leading-relaxed whitespace-pre-line">
                        {rec.comment}
                      </p>
                    </div>

                    {/* Comment Images */}
                    {rec.images && rec.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {rec.images.map((img, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-[#EAE3D5] h-32">
                            <img 
                              src={img} 
                              alt={`Foto ${idx + 1}`} 
                              className="w-full h-full object-cover cursor-pointer"
                              referrerPolicy="no-referrer"
                              onClick={() => setLightboxImage(img)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Link */}
                    {rec.link && (
                      <a 
                        href={rec.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C7364] hover:text-[#3E342F] pt-2"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        {rec.linkText || rec.link}
                      </a>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredRecs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE3D5] p-6 space-y-2">
              <p className="text-sm font-bold text-[#3E342F]">
                {activeFilter === 'FAVORITOS' ? 'Nenhuma favorito ainda' : 'Nenhuma recomendação encontrada'}
              </p>
              <p className="text-xs text-[#8C7364]">
                {activeFilter === 'FAVORITOS' 
                  ? 'Coração nos posts para salvá-los aqui.' 
                  : 'Use outros filtros ou seja o primeiro a sugerir um profissional.'}
              </p>
            </div>
          )}
        </div>

        {/* Floating Add button for mobile */}
        <button 
          onClick={handleOpenAdd}
          className="fixed right-5 bottom-24 z-40 w-14 h-14 bg-[#8C7364] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-[#7A6355] active:bg-[#685346] md:hidden cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>

      </main>

      {/* Floating Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
              <h3 className="font-extrabold text-base text-[#3E342F] font-display">
                {editingRec ? 'Editar Recomendação' : 'Nova Recomendação'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Profissional / Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Eletricista Silva"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Categoria de Serviço</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                >
                  <option value="MARCENARIA">Marcenaria</option>
                  <option value="ELÉTRICA">Elétrica</option>
                  <option value="PAISAGISMO">Paisagismo</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              {/* Custom category input when OUTROS is selected */}
              {category === 'OUTROS' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Nome da Categoria</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pintura, Encanador, Limpeza..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Avaliação</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Sua Indicação (Comentário)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva sua experiência com este profissional, qualidade do acabamento, preço, pontualidade..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] resize-none"
                />
              </div>

              {/* Link input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Link (opcional)</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com"
                  value={commentLink}
                  onChange={(e) => setCommentLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
                {commentLink && (
                  <input
                    type="text"
                    placeholder="Texto do link (ex: Ver site)"
                    value={commentLinkText}
                    onChange={(e) => setCommentLinkText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] mt-1"
                  />
                )}
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">Fotos do Post (opcional)</label>
                <input
                  type="file"
                  ref={commentFileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleCommentImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => commentFileInputRef.current?.click()}
                  disabled={uploadingImg}
                  className="w-full py-2.5 border border-dashed border-[#E5DFD5] hover:border-[#8C7364] hover:bg-[#F5F2EB] text-[#8C7364] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                >
                  <ImageIcon className="w-4 h-4" />
                  {uploadingImg ? 'Enviando...' : 'Adicionar Fotos'}
                </button>
                {uploadError && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">{uploadError}</p>
                )}

                {/* Preview uploaded images */}
                {commentImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {commentImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-[#EAE3D5] h-20">
                        <img 
                          src={img} 
                          alt={`Upload ${idx + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCommentImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider mt-2 cursor-pointer transition-colors"
              >
                {editingRec ? 'Salvar Alterações' : 'Publicar Indicação'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bottom Nav / Footer Navigation */}
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

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/30 hover:bg-black/50 transition-colors z-10 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={lightboxImage}
              alt="Imagem ampliada"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
