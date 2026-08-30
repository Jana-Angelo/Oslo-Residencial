import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  User,
  Plus,
  X,
  Search,
  Send,
  ThumbsUp,
  Eye,
  MessageCircle,
  MessageSquare,
  Pin,
  Star,
  Trash2,
  CheckCircle2,
  ImagePlus,
  ChevronDown,
  Wrench,
  Sparkles,
  ShieldAlert,
  Shield,
  Droplets,
  Zap,
  BrushCleaning,
  Volume2,
  Megaphone,
  MoreHorizontal,
  Info,
  MoreVertical,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react';
import { Sidebar, MobileBottomNav, MobileHeader } from './shared';
import { overlayPanel, overlayScrim } from './shared/motion';
import { Ocorrencia, OcorrenciaComment, OcorrenciaStatus, UserProfile } from '../types';
import { storageService } from '../lib/storage';

type NavScreen = 'login' | 'caixa' | 'avisos' | 'dashboard' | 'indica_apt' | 'perfil' | 'ocorrencias';

interface OcorrenciasScreenProps {
  ocorrencias: Ocorrencia[];
  userProfile: UserProfile;
  isAdmin: boolean;
  onAddOcorrencia: (occ: Ocorrencia) => void;
  onEditOcorrencia: (occ: Ocorrencia) => void;
  onDeleteOcorrencia: (id: string) => void;
  onToggleLike: (id: string) => void;
  onAddComment: (id: string, comment: OcorrenciaComment) => void;
  onIncrementViews: (ids: string[]) => void;
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
}

const STATUSES: OcorrenciaStatus[] = ['Aberta', 'Em análise', 'Resolvida'];

const CATEGORIES = ['Estrutura', 'Elétrica', 'Limpeza', 'Segurança', 'Água', 'Vazamento', 'Ruído', 'Outros'];

const MAX_IMAGES = 5;
const EDIT_WINDOW_MS = 3 * 60 * 1000;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'name', label: 'Nome do morador' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'category', label: 'Categoria' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatRelativeTime(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60_000) return 'Agora';

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `há ${minutes} minuto${minutes === 1 ? '' : 's'}`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (date.getTime() >= startOfToday) return `há ${hours} hora${hours === 1 ? '' : 's'}`;
  if (date.getTime() >= startOfToday - 86_400_000) return 'Ontem';
  if (date.getTime() >= startOfToday - 6 * 86_400_000) return WEEKDAYS[date.getDay()];

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatFullDateTime(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${day}/${month}/${year} · ${hours}:${minutes}`;
}

function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'Segurança': return 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]';
    case 'Limpeza': return 'bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5]';
    case 'Estrutura': return 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]';
    case 'Elétrica': return 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]';
    case 'Água': return 'bg-[#F0F9FF] text-[#0284C7] border border-[#E0F2FE]';
    case 'Vazamento': return 'bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]';
    default: return 'bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]';
  }
}


function Avatar({ name, apartment, src, className }: { name: string; apartment: string; src?: string; className?: string }) {
  const fallback = (name || apartment || '?').trim().charAt(0).toUpperCase() || '?';
  if (src) {
    return (
      <img
        src={src}
        alt={name || apartment}
        className={`rounded-full object-cover border border-[#EAE3D5] ${className || 'w-9 h-9'}`}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-[#8C7364] text-white font-extrabold flex items-center justify-center font-display shadow-sm ${className || 'w-9 h-9 text-sm'}`}
    >
      {fallback}
    </div>
  );
}

function getCategoryIcon(category: string, className = 'w-3.5 h-3.5') {
  switch (category) {
    case 'Elétrica': return <Zap className={className} />;
    case 'Segurança': return <ShieldAlert className={className} />;
    case 'Limpeza': return <Sparkles className={className} />;
    case 'Água': return <Droplets className={className} />;
    case 'Vazamento': return <Droplets className={className} />;
    default: return <Wrench className={className} />;
  }
}

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; color: string }> = {
  'Segurança': { icon: <Shield size={15} />, color: '#FF6B6B' },
  'Estrutura': { icon: <Building2 size={15} />, color: '#4D9DFD' },
  'Limpeza': { icon: <BrushCleaning size={15} />, color: '#7BC96F' },
  'Elétrica': { icon: <Zap size={15} />, color: '#FFC542' },
  'Água': { icon: <Droplets size={15} />, color: '#53A8FF' },
  'Vazamento': { icon: <Droplets size={15} />, color: '#2EC4B6' },
  'Ruído': { icon: <Volume2 size={15} />, color: '#B083F0' },
};

function getCategoryStyle(category: string): { icon: React.ReactNode; color: string } {
  return CATEGORY_STYLES[category] ?? { icon: <MoreHorizontal size={15} color="#777" />, color: '#E8E8E8' };
}

function StatusBadge({ status }: { status: OcorrenciaStatus }) {
  const styles: Record<OcorrenciaStatus, string> = {
    'Aberta': 'bg-[#EBF7ED] text-[#2E7D32] border border-[#C8E6C9]/40',
    'Em análise': 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]/40',
    'Resolvida': 'bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]/40',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-normal ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function OcorrenciasScreen({
  ocorrencias,
  userProfile,
  isAdmin,
  onAddOcorrencia,
  onEditOcorrencia,
  onDeleteOcorrencia,
  onToggleLike,
  onAddComment,
  onIncrementViews,
  onNavigate,
}: OcorrenciasScreenProps) {
  // ----- Feed states -----
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeStatus, setActiveStatus] = useState<string>('Todos');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [toastOcc, setToastOcc] = useState<Ocorrencia | null>(null);
  const [summaryModal, setSummaryModal] = useState<{ kind: 'status' | 'category'; value: string } | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [cardMenuId, setCardMenuId] = useState<string | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // ----- Composer states -----
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Estrutura');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const composerFileRef = useRef<HTMLInputElement>(null);

  // ----- Edit modal states -----
  const [editingOcc, setEditingOcc] = useState<Ocorrencia | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('Estrutura');
  const [editStatus, setEditStatus] = useState<OcorrenciaStatus>('Aberta');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editPinned, setEditPinned] = useState(false);
  const [editHighlighted, setEditHighlighted] = useState(false);
  const [editAddingImages, setEditAddingImages] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [adminMenuId, setAdminMenuId] = useState<string | null>(null);

  // ----- Views: increment once per post per session (module-level guard survives StrictMode) -----
  const viewedIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const unseen = ocorrencias.filter(o => !viewedIds.current.has(o.id)).map(o => o.id);
    if (unseen.length === 0) return;
    unseen.forEach(id => viewedIds.current.add(id));
    onIncrementViews(unseen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- Toast auto-dismiss -----
  useEffect(() => {
    if (!toastOcc) return;
    const t = setTimeout(() => setToastOcc(null), 6000);
    return () => clearTimeout(t);
  }, [toastOcc]);

  const categories = ['Todos', ...Array.from(new Set([...CATEGORIES, ...ocorrencias.map(o => o.category)]))];

  const filtered = ocorrencias.filter(o => {
    const matchesSearch = searchQuery === '' ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.apartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || o.category === activeCategory;
    const matchesStatus = activeStatus === 'Todos' || o.status === activeStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    switch (sortOption) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name':
        return (a.authorName || '').localeCompare(b.authorName || '', 'pt-BR', { sensitivity: 'base' });
      case 'apartment':
        return (a.apartment || '').localeCompare(b.apartment || '', undefined, { numeric: true });
      case 'category':
        return (a.category || '').localeCompare(b.category || '', 'pt-BR', { sensitivity: 'base' });
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';
  const isOwn = (occ: Ocorrencia) =>
    occ.apartment === userProfile.apartmentNumber ||
    occ.authorUserId === userProfile.apartmentNumber ||
    occ.authorName === userProfile.fullName;
  const canEdit = (occ: Ocorrencia) =>
    isAdmin || (isOwn(occ) && Date.now() - new Date(occ.createdAt).getTime() < EDIT_WINDOW_MS);

  // ----- Composer -----
  const handleSelectImages = async (files: FileList | null) => {
    if (!files) return;
    setUploadingImg(true);
    setUploadError('');
    for (const file of Array.from(files)) {
      if (newImages.length >= MAX_IMAGES) break;
      try {
        const url = await storageService.uploadOcorrenciaImage(file);
        setNewImages(prev => [...prev, url]);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setNewImages(prev => (prev.length >= MAX_IMAGES ? prev : [...prev, reader.result as string]));
          }
        };
        reader.onerror = () => setUploadError('Falha ao processar a imagem.');
        reader.readAsDataURL(file);
      }
    }
    setUploadingImg(false);
    if (composerFileRef.current) composerFileRef.current.value = '';
  };

  const resetComposer = () => {
    setNewDescription('');
    setNewCategory('Estrutura');
    setNewImages([]);
    setUploadError('');
    if (composerFileRef.current) composerFileRef.current.value = '';
    setIsComposerOpen(false);
  };

  const handlePublish = () => {
    const description = newDescription.trim();
    if (!description) return;
    const occ: Ocorrencia = {
      id: `occ-${Date.now()}`,
      description,
      category: newCategory,
      status: 'Aberta',
      authorName: userProfile.fullName || 'Morador',
      avatar: userProfile.avatar || '',
      apartment: userProfile.apartmentNumber || 'Apartamento ?',
      images: newImages,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      views: 1,
      viewedBy: [userProfile.apartmentNumber || userProfile.fullName || 'morador'],
      comments: [],
      pinned: false,
      highlighted: false,
      authorUserId: userProfile.apartmentNumber,
    };
    onAddOcorrencia(occ);
    setToastOcc(occ);
    resetComposer();
  };

  // ----- Edit modal -----
  const openEdit = (occ: Ocorrencia) => {
    setEditingOcc(occ);
    setEditDescription(occ.description);
    setEditCategory(occ.category);
    setEditStatus(occ.status);
    setEditImages(occ.images || []);
    setEditPinned(occ.pinned);
    setEditHighlighted(occ.highlighted);
    setEditAddingImages(false);
  };

  const handleEditImageRemove = (img: string) => {
    if (!editingOcc) return;
    setEditImages(prev => prev.filter(i => i !== img));
    if (img.startsWith('http')) {
      storageService.deleteOcorrenciaImage(img).catch(() => {});
    }
  };

  const handleEditImageAdd = async (files: FileList | null) => {
    if (!files) return;
    setEditAddingImages(true);
    for (const file of Array.from(files)) {
      if (editImages.length >= MAX_IMAGES) break;
      try {
        const url = await storageService.uploadOcorrenciaImage(file);
        setEditImages(prev => (prev.length >= MAX_IMAGES ? prev : [...prev, url]));
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setEditImages(prev => (prev.length >= MAX_IMAGES ? prev : [...prev, reader.result as string]));
          }
        };
        reader.readAsDataURL(file);
      }
    }
    setEditAddingImages(false);
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const handleSaveEdit = () => {
    if (!editingOcc || !editDescription.trim()) return;
    const updated: Ocorrencia = {
      ...editingOcc,
      description: editDescription.trim(),
      category: editCategory,
      status: editStatus,
      images: editImages,
      pinned: editPinned,
      highlighted: editHighlighted,
    };
    onEditOcorrencia(updated);
    setEditingOcc(null);
  };

  // ----- Quick admin status actions -----
  const setStatus = (occ: Ocorrencia, status: OcorrenciaStatus) => {
    onEditOcorrencia({ ...occ, status });
    setAdminMenuId(null);
  };

  const togglePin = (occ: Ocorrencia) => {
    onEditOcorrencia({ ...occ, pinned: !occ.pinned });
    setAdminMenuId(null);
  };

  const toggleHighlight = (occ: Ocorrencia) => {
    onEditOcorrencia({ ...occ, highlighted: !occ.highlighted });
    setAdminMenuId(null);
  };

  // ----- Comments -----
  const toggleComments = (id: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendComment = (occ: Ocorrencia) => {
    const text = (commentDrafts[occ.id] || '').trim();
    if (!text) return;
    const comment: OcorrenciaComment = {
      id: `cmt-${Date.now()}`,
      authorName: userProfile.fullName || 'Morador',
      avatar: userProfile.avatar || '',
      apartment: userProfile.apartmentNumber || 'Apartamento ?',
      comment: text,
      createdAt: new Date().toISOString(),
    };
    onAddComment(occ.id, comment);
    setCommentDrafts(prev => ({ ...prev, [occ.id]: '' }));
  };

  const stats = {
    total: ocorrencias.length,
    emAberto: ocorrencias.filter(o => o.status === 'Aberta').length,
    emAnalise: ocorrencias.filter(o => o.status === 'Em análise').length,
    resolvidas: ocorrencias.filter(o => o.status === 'Resolvida').length,
    views: ocorrencias.reduce((s, o) => s + o.views, 0),
  };

  const categoryCounts = ocorrencias.reduce<Record<string, number>>((acc, o) => {
    const cat = (o.category || '').trim() || 'Outros';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const summaryTitle = summaryModal
    ? summaryModal.kind === 'status'
      ? summaryModal.value === 'Total'
        ? 'Total de Ocorrências'
        : summaryModal.value
      : `Ocorrências · ${summaryModal.value}`
    : '';

  const summaryList = summaryModal
    ? ocorrencias
        .filter(o =>
          summaryModal.kind === 'status'
            ? summaryModal.value === 'Total' || o.status === summaryModal.value
            : o.category === summaryModal.value
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col pb-20 md:pb-0 md:pl-64">
      <Sidebar activeScreen="ocorrencias" isAdmin={isAdmin} onNavigate={onNavigate} />
      <MobileHeader
        title="Ocorrências"
        subtitle="Registro e Acompanhamento"
        userProfile={userProfile}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-8 max-w-[1280px] mx-auto w-full space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
          {/* Timeline column */}
          <div className="space-y-[18px] max-w-[860px] w-full">
            {/* Redesigned Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-10 rounded-full bg-orange-400" />
                <div>
                  <h2 className="text-3xl font-extrabold text-[#3E342F] tracking-tight font-display">Ocorrências</h2>
                  <p className="text-xs text-[#8C7364] font-medium mt-1">Compartilhe uma ocorrência importante.</p>
                </div>
              </div>
              <button
                data-onboarding="ocorrencias:nova"
                onClick={() => setIsComposerOpen(prev => !prev)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nova publicação
              </button>
            </div>

            {/* Composer (Collapsible) */}
            <AnimatePresence>
              {isComposerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-xs p-4 space-y-3 mb-2">
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={userProfile.fullName}
                        apartment={userProfile.apartmentNumber}
                        src={userProfile.avatar}
                        className="w-10 h-10 text-base shrink-0"
                      />
                      <textarea
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        placeholder="Descreva a ocorrência encontrada..."
                        rows={3}
                        className="flex-1 px-3.5 py-2.5 bg-[#FBF9F6] border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] resize-none"
                      />
                    </div>

                    {/* Image previews before sending */}
                    {newImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {newImages.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-[#EAE3D5] h-20 bg-[#F5F2EB]">
                            <img src={img} alt={`Prévia ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          ref={composerFileRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={e => handleSelectImages(e.target.files)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => composerFileRef.current?.click()}
                          disabled={uploadingImg || newImages.length >= MAX_IMAGES}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                          <ImagePlus className="w-3.5 h-3.5" />
                          {uploadingImg ? 'Enviando...' : newImages.length >= MAX_IMAGES ? `Limite (${MAX_IMAGES})` : `Foto · até ${MAX_IMAGES}`}
                        </button>

                        <select
                          value={newCategory}
                          onChange={e => setNewCategory(e.target.value)}
                          className="px-3 py-2 bg-[#F5F2EB] text-[#8C7364] border border-transparent rounded-xl text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#8C7364] cursor-pointer"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {newImages.length > 0 && (
                          <span className="text-[10px] font-semibold text-[#A6978A]">
                            {newImages.length}/{MAX_IMAGES} fotos
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={resetComposer}
                          className="px-4 py-2 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handlePublish}
                          disabled={!newDescription.trim()}
                          className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Publicar
                        </button>
                      </div>
                    </div>

                    {uploadError && <p className="text-[10px] text-red-500 font-bold">{uploadError}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter pills */}
            <div data-onboarding="ocorrencias:filtros" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['Todas', 'Abertas', 'Resolvidas', 'Segurança', 'Limpeza', 'Estrutura', 'Elétrica', 'Água', 'Outros'].map(pill => {
                const isTodas = pill === 'Todas';
                const isAbertas = pill === 'Abertas';
                const isResolvidas = pill === 'Resolvidas';
                
                const isActive = isTodas
                  ? activeCategory === 'Todos' && activeStatus === 'Todos'
                  : isAbertas
                    ? activeStatus === 'Aberta' && activeCategory === 'Todos'
                    : isResolvidas
                      ? activeStatus === 'Resolvida' && activeCategory === 'Todos'
                      : activeCategory === pill;

                const handleClick = () => {
                  if (isTodas) {
                    setActiveCategory('Todos');
                    setActiveStatus('Todos');
                  } else if (isAbertas) {
                    setActiveCategory('Todos');
                    setActiveStatus('Aberta');
                  } else if (isResolvidas) {
                    setActiveCategory('Todos');
                    setActiveStatus('Resolvida');
                  } else {
                    setActiveCategory(pill);
                    setActiveStatus('Todos');
                  }
                };

                return (
                  <button
                    key={pill}
                    onClick={handleClick}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#8C7364] text-white shadow-xs'
                        : 'bg-white text-[#8C7364] hover:bg-[#F5F2EB] border border-[#EAE3D5]'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6978A]" />
                <input
                  data-onboarding="ocorrencias:busca"
                  type="text"
                  placeholder="Buscar ocorrências..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#EAE3D5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A6978A] hover:text-[#3E342F] p-0.5 rounded-full hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative shrink-0">
                <button
                  data-onboarding="ocorrencias:ordenacao"
                  onClick={() => setIsSortMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#EAE3D5] rounded-xl text-xs font-semibold text-[#3E342F] hover:bg-[#F5F2EB] cursor-pointer shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#A6978A]" />
                  <span>{SORT_OPTIONS.find(o => o.value === sortOption)?.label || 'Mais recentes'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#A6978A] transition-transform ${isSortMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-52 bg-white border border-[#EAE3D5] rounded-xl shadow-xl p-1.5 z-30 flex flex-col gap-0.5 overflow-y-auto max-h-72 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortOption(opt.value); setIsSortMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                            sortOption === opt.value ? 'bg-[#8C7364] text-white' : 'text-[#6E6157] hover:bg-[#F5F2EB]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-[18px]">
              <AnimatePresence mode="popLayout">
                {sorted.map(occ => {
                  const expanded = expandedComments.has(occ.id);
                  const liked = occ.likedBy.includes(userKey);
                  const showEdit = canEdit(occ);
                  const showAdmin = isAdmin;

                  return (
                    <motion.div
                      key={occ.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`bg-white rounded-[18px] overflow-hidden border-[1px] min-h-[220px] transition-shadow shadow-[0_8px_30px_rgba(0,0,0,0.05)] relative ${
                        occ.pinned
                          ? 'border-[#CBBFB7]'
                          : 'border-[#EAE3D5]'
                      }`}
                    >
                      {/* Header */}
                      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            name={occ.authorName}
                            apartment={occ.apartment}
                            src={occ.avatar}
                            className="w-10 h-10 text-base shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-[#3E342F] truncate">
                                {occ.authorName || 'Morador'}
                              </p>
                              <span data-onboarding="ocorrencias:status_badge">
                                <StatusBadge status={occ.status} />
                              </span>
                            </div>
                            <p className="text-[10px] text-[#A6978A] font-semibold truncate mt-0.5">
                              {occ.apartment}
                            </p>
                          </div>
                        </div>

                        {/* Actions & Timestamp */}
                        <div className="flex items-center gap-3 shrink-0 relative">
                          <span className="text-[10px] text-[#A6978A] font-semibold">
                            {formatRelativeTime(occ.createdAt)}
                          </span>
                          {(showEdit || showAdmin) && (
                            <div className="relative">
                              <button
                              data-onboarding="ocorrencias:editar_propria"
                              onClick={() => setCardMenuId(cardMenuId === occ.id ? null : occ.id)}
                                className="p-1.5 hover:bg-[#F5F2EB] rounded-full transition-colors cursor-pointer text-[#A6978A] hover:text-[#3E342F]"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              <AnimatePresence>
                                {cardMenuId === occ.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute right-0 mt-1 w-44 bg-white border border-[#EAE3D5] rounded-xl shadow-xl p-1.5 z-20 flex flex-col gap-0.5 overflow-y-auto max-h-40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                  >
                                    {showAdmin && (
                                      <>
                                        {STATUSES.map(st => (
                                          <button
                                            key={st}
                                            onClick={() => { setStatus(occ, st); setCardMenuId(null); }}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                                              occ.status === st ? 'bg-[#8C7364] text-white' : 'text-[#6E6157] hover:bg-[#F5F2EB]'
                                            }`}
                                          >
                                            Definir {st}
                                          </button>
                                        ))}
                                        <div className="h-[1px] bg-[#EAE3D5] my-1" />
                                        <button
                                          onClick={() => { togglePin(occ); setCardMenuId(null); }}
                                          className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#6E6157] hover:bg-[#F5F2EB]"
                                        >
                                          {occ.pinned ? 'Desafixar' : 'Fixar'}
                                        </button>
                                        <button
                                          onClick={() => { toggleHighlight(occ); setCardMenuId(null); }}
                                          className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#6E6157] hover:bg-[#F5F2EB]"
                                        >
                                          {occ.highlighted ? 'Remover Destaque' : 'Destacar'}
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => { openEdit(occ); setCardMenuId(null); }}
                                      className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#6E6157] hover:bg-[#F5F2EB]"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => { setDeleteConfirmId(occ.id); setCardMenuId(null); }}
                                      className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50"
                                    >
                                      Excluir
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content body (Horizontal layout) */}
                      <div className="px-5 pb-4 flex flex-col md:flex-row gap-4 items-start">
                        {occ.images && occ.images.length > 0 ? (
                          <div className="w-full md:w-44 h-28 rounded-xl overflow-hidden border border-[#EAE3D5] bg-[#F5F2EB] shrink-0">
                            <img
                              src={occ.images[0]}
                              alt="Ocorrência"
                              className="w-full h-full object-cover cursor-pointer"
                              referrerPolicy="no-referrer"
                              onClick={() => setLightboxImage(occ.images[0])}
                            />
                          </div>
                        ) : null}

                        <div className="flex-1 space-y-3 min-w-0">
                          <p className="text-xs text-[#3E342F] leading-relaxed whitespace-pre-line font-medium">
                            {occ.description}
                          </p>

                          {/* Category hash tag style */}
                          <div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${getCategoryBadgeClass(occ.category)}`}>
                              #{occ.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Bar */}
                      <div className="px-5 py-3 border-t border-[#F5F2EB] flex items-center justify-between text-[11px] text-[#A6978A] font-semibold bg-[#FBF9F6]/20">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#A6978A]" />
                            {formatFullDateTime(occ.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#A6978A]" />
                            {occ.views} moradores visualizaram
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            data-onboarding="ocorrencias:curtir"
                            onClick={() => onToggleLike(occ.id)}
                            className={`flex items-center gap-1.5 hover:text-[#8C7364] transition-colors cursor-pointer ${liked ? 'text-[#8C7364]' : ''}`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                            <span>{occ.likes}</span>
                          </button>
                          <button
                            data-onboarding="ocorrencias:comentar"
                            onClick={() => toggleComments(occ.id)}
                            className={`flex items-center gap-1.5 hover:text-[#8C7364] transition-colors cursor-pointer ${expanded ? 'text-[#8C7364]' : ''}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{occ.comments.length}</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="px-5">
                        {occ.comments.length > 0 && !expanded && (
                          <button
                            onClick={() => toggleComments(occ.id)}
                            className="w-full py-2.5 text-left text-[10px] font-bold text-[#8C7364] hover:text-[#3E342F] cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Ver {occ.comments.length} comentário{occ.comments.length === 1 ? '' : 's'}
                            <ChevronDown className="w-3 h-3 ml-auto" />
                          </button>
                        )}

                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 py-3">
                                {occ.comments.map(c => (
                                  <div key={c.id} className="flex items-start gap-2.5">
                                    <Avatar
                                      name={c.authorName}
                                      apartment={c.apartment}
                                      src={c.avatar}
                                      className="w-7 h-7 text-xs shrink-0"
                                    />
                                    <div className="flex-1 bg-[#F5F2EB]/60 border border-[#F5F2EB] rounded-xl rounded-tl-sm px-3 py-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <p className="font-extrabold text-[10px] text-[#3E342F]">
                                          {c.authorName}
                                          <span className="font-semibold text-[#A6978A]"> · {c.apartment}</span>
                                        </p>
                                        <span className="text-[9px] font-semibold text-[#A6978A] shrink-0">
                                          {formatRelativeTime(c.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-[#6E6157] leading-relaxed mt-1 whitespace-pre-line">{c.comment}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Comment input */}
                                <div className="flex items-start gap-2.5 pt-1">
                                  <Avatar
                                    name={userProfile.fullName}
                                    apartment={userProfile.apartmentNumber}
                                    src={userProfile.avatar}
                                    className="w-7 h-7 text-xs shrink-0"
                                  />
                                  <div className="flex-1 flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Escreva um comentário..."
                                      value={commentDrafts[occ.id] || ''}
                                      onChange={e => setCommentDrafts(prev => ({ ...prev, [occ.id]: e.target.value }))}
                                      onKeyDown={e => { if (e.key === 'Enter') handleSendComment(occ); }}
                                      className="flex-1 px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                                    />
                                    <button
                                      onClick={() => handleSendComment(occ)}
                                      disabled={!(commentDrafts[occ.id] || '').trim()}
                                      className="w-9 h-9 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    >
                                      <Send className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {sorted.length === 0 && (
                <div className="text-center py-14 bg-white rounded-2xl border border-[#EAE3D5] p-8 space-y-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-6 left-8 w-1.5 h-1.5 rounded-full bg-[#8C7364]" />
                    <div className="absolute top-12 right-12 w-1 h-1 rounded-full bg-[#8C7364]" />
                    <div className="absolute bottom-10 left-16 w-1 h-1 rounded-full bg-[#8C7364]" />
                    <div className="absolute top-20 left-1/3 w-1.5 h-1.5 rounded-full bg-[#8C7364]" />
                    <div className="absolute bottom-6 right-1/4 w-1 h-1 rounded-full bg-[#8C7364]" />
                    <div className="absolute top-1/2 left-6 w-1 h-1 rounded-full bg-[#8C7364]" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                      <Megaphone className="w-7 h-7 text-orange-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 relative z-10">
                    <h3 className="text-sm font-extrabold text-[#3E342F] font-display">Nenhuma ocorrência ainda</h3>
                    <p className="text-xs text-[#8C7364] max-w-[280px] mx-auto leading-relaxed">
                      Seja o primeiro a registrar uma ocorrência no condomínio. Sua participação ajuda todos os moradores.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1 pt-1 relative z-10">
                    <div className="w-8 h-[2px] rounded-full bg-[#EAE3D5]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4C9BB]" />
                    <div className="w-8 h-[2px] rounded-full bg-[#EAE3D5]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar (desktop) / below (mobile) */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            {/* Summary card */}
            <div data-onboarding="ocorrencias:resumo_feed" className="bg-white border border-[#EAE3D5] rounded-2xl shadow-xs p-5 space-y-3">
              <h3 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase">Resumo do Feed</h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={isAdmin ? () => setSummaryModal({ kind: 'status', value: 'Aberta' }) : undefined}
                  title={isAdmin ? 'Ver ocorrências em aberto' : undefined}
                  className={`bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-3 ${isAdmin ? 'cursor-pointer hover:bg-white hover:border-[#8C7364]/40 hover:shadow-sm transition-all' : ''}`}
                >
                  <p className="text-2xl font-extrabold text-[#8C7364] font-display">{stats.emAberto}</p>
                  <p className="text-[10px] font-bold text-[#6E6157] uppercase tracking-wider">Em aberto</p>
                </div>
                <div
                  onClick={isAdmin ? () => setSummaryModal({ kind: 'status', value: 'Resolvida' }) : undefined}
                  title={isAdmin ? 'Ver ocorrências resolvidas' : undefined}
                  className={`bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-3 ${isAdmin ? 'cursor-pointer hover:bg-white hover:border-[#8C7364]/40 hover:shadow-sm transition-all' : ''}`}
                >
                  <p className="text-2xl font-extrabold text-[#2E7D4F] font-display">{stats.resolvidas}</p>
                  <p className="text-[10px] font-bold text-[#6E6157] uppercase tracking-wider">Resolvidas</p>
                </div>
                <div
                  onClick={isAdmin ? () => setSummaryModal({ kind: 'status', value: 'Em análise' }) : undefined}
                  title={isAdmin ? 'Ver ocorrências em análise' : undefined}
                  className={`bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-3 ${isAdmin ? 'cursor-pointer hover:bg-white hover:border-[#8C7364]/40 hover:shadow-sm transition-all' : ''}`}
                >
                  <p className="text-2xl font-extrabold text-[#3B5BDB] font-display">{stats.emAnalise}</p>
                  <p className="text-[10px] font-bold text-[#6E6157] uppercase tracking-wider">Em análise</p>
                </div>
                <div
                  onClick={isAdmin ? () => setSummaryModal({ kind: 'status', value: 'Total' }) : undefined}
                  title={isAdmin ? 'Ver todas as ocorrências' : undefined}
                  className={`bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-3 ${isAdmin ? 'cursor-pointer hover:bg-white hover:border-[#8C7364]/40 hover:shadow-sm transition-all' : ''}`}
                >
                  <p className="text-2xl font-extrabold text-[#3E342F] font-display">{stats.total}</p>
                  <p className="text-[10px] font-bold text-[#6E6157] uppercase tracking-wider">Total</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#F5F2EB]">
                <span className="text-[10px] font-semibold text-[#6E6157]">Visualizações no total</span>
                <span className="flex items-center gap-1 text-xs font-extrabold text-[#8C7364]">
                  <Eye className="w-3.5 h-3.5" /> {stats.views}
                </span>
              </div>
            </div>

            {/* Top categories card */}
            <div data-onboarding="ocorrencias:categorias" className="flex flex-col w-full h-[260px] bg-white border border-[#EAE3D5] rounded-[18px] p-[22px] shadow-[0_8px_30px_rgba(58,38,16,0.05),0_2px_6px_rgba(0,0,0,0.03)]">
              <h3 className="text-xl font-bold text-[#3E342F] mb-3">Categorias mais relatadas</h3>
              {topCategories.length > 0 ? (
                <div className="space-y-3 flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {topCategories.map(([cat, count]) => {
                    const style = getCategoryStyle(cat);
                    return (
                      <div
                        key={cat}
                        onClick={isAdmin ? () => setSummaryModal({ kind: 'category', value: cat }) : undefined}
                        title={isAdmin ? `Ver ocorrências de ${cat}` : undefined}
                        className={`group flex items-center justify-between h-9 ${isAdmin ? 'cursor-pointer rounded-xl px-2 -mx-2 hover:bg-[#F5F2EB] transition-colors' : ''}`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white shrink-0" style={{ background: style.color }}>
                            {style.icon}
                          </div>
                          <span className="text-[15px] font-medium text-[#3E342F] truncate">{cat}</span>
                        </div>
                        <span className="text-[17px] font-medium text-[#A6978A] shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#A6978A] py-4 text-center">Nenhuma ocorrência ainda.</p>
              )}
            </div>

            {/* About / transparency card */}
            <div className="bg-[#F5F2EB]/50 border border-[#EAE3D5] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#8C7364]" />
                <h3 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase">Sobre o Feed</h3>
              </div>
              <p className="text-xs text-[#6E6157] leading-relaxed">
                Uma rede social privada do condomínio. Publique ocorrências, acompanhe o andamento e colabore com
                seus vizinhos. O síndico acompanha tudo e mantém o histórico transparente.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />
                <span className="text-[10px] font-semibold text-[#6E6157]">Transparência total no acompanhamento</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <MobileBottomNav activeScreen="ocorrencias" isAdmin={isAdmin} onNavigate={onNavigate} />

      {/* Edit modal */}
      <AnimatePresence>
        {editingOcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayScrim}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setEditingOcc(null)}
            className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
          />
          <motion.div
            variants={overlayPanel}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
              <h3 className="font-extrabold text-base text-[#3E342F] font-display">
                {isAdmin ? 'Editar Ocorrência' : 'Editar Ocorrência'}
              </h3>
              <button
                onClick={() => setEditingOcc(null)}
                className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Descrição</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Descreva a ocorrência encontrada..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] resize-none"
                />
              </div>

              {isAdmin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Categoria</label>
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Status</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as OcorrenciaStatus)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditPinned(v => !v)}
                      className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border ${
                        editPinned ? 'bg-[#8C7364] text-white border-[#8C7364]' : 'bg-white text-[#6E6157] border-[#E5DFD5]'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5 inline mr-1" /> {editPinned ? 'Fixada' : 'Fixar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditHighlighted(v => !v)}
                      className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border ${
                        editHighlighted ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-[#6E6157] border-[#E5DFD5]'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 inline mr-1" /> {editHighlighted ? 'Destacada' : 'Destacar'}
                    </button>
                  </div>
                </>
              )}

              {/* Images management */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">Fotos</label>
                {editImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {editImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-[#EAE3D5] h-20 bg-[#F5F2EB]">
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleEditImageRemove(img)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {editImages.length < MAX_IMAGES && (
                  <>
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handleEditImageAdd(e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileRef.current?.click()}
                      disabled={editAddingImages}
                      className="w-full py-2.5 border border-dashed border-[#E5DFD5] hover:border-[#8C7364] hover:bg-[#F5F2EB] text-[#8C7364] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {editAddingImages ? 'Enviando...' : 'Adicionar Fotos'}
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOcc(null)}
                  className="flex-1 py-2.5 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364] font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editDescription.trim()}
                  className="flex-1 py-2.5 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
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
              <h3 className="font-extrabold text-base text-[#3E342F] font-display">Excluir Ocorrência?</h3>
              <p className="text-xs text-[#6E6157] leading-relaxed">
                Esta ação removerá a publicação e seus comentários para todos os moradores. Não pode ser desfeita.
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
                    onDeleteOcorrencia(deleteConfirmId);
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

      {/* Feed summary popup (admin only) */}
      <AnimatePresence>
        {summaryModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayScrim}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setSummaryModal(null)}
            className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
          />
          <motion.div
            variants={overlayPanel}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
              <h3 className="font-extrabold text-base text-[#3E342F] font-display">{summaryTitle}</h3>
              <button
                onClick={() => setSummaryModal(null)}
                className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">
              {summaryList.length} ocorrência{summaryList.length === 1 ? '' : 's'}
            </p>

            {summaryList.length > 0 ? (
              <div className="space-y-2.5">
                {summaryList.map(o => (
                  <div key={o.id} className="bg-white border border-[#EAE3D5] rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <StatusBadge status={o.status} />
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F5F2EB] text-[#8C7364] rounded-md text-[9px] font-bold uppercase tracking-wider">
                          {getCategoryIcon(o.category, 'w-3 h-3')}
                          {o.category}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-[#A6978A] shrink-0">{formatRelativeTime(o.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#3E342F] leading-relaxed line-clamp-3 whitespace-pre-line">{o.description}</p>
                    <p className="text-[10px] font-semibold text-[#A6978A]">
                      <User className="w-3 h-3 inline mr-0.5" />
                      {o.authorName || 'Morador'} · {o.apartment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-[#A6978A] py-6">Nenhuma ocorrência neste item.</p>
            )}
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {/* Push notification toast */}
      <AnimatePresence>
        {toastOcc && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-[#3E342F] text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3"
          >
            <div className="w-9 h-9 bg-[#8C7364] rounded-xl flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#CBBFB7] uppercase tracking-wider">Confirmação</p>
              <p className="text-xs font-extrabold mt-0.5">Nova ocorrência registrada</p>
              <p className="text-xs text-[#E8E2DC] mt-0.5">
                <span className="font-bold">{toastOcc.apartment}</span> — {toastOcc.description}
              </p>
              <p className="text-[10px] text-[#CBBFB7] font-semibold mt-1">{formatRelativeTime(toastOcc.createdAt)}</p>
            </div>
            <button
              onClick={() => setToastOcc(null)}
              className="p-1 text-[#CBBFB7] hover:text-white rounded-lg shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image lightbox */}
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
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
