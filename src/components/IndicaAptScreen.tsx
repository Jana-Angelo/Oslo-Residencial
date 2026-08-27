import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Recommendation, UserProfile, OcorrenciaComment } from '../types';
import { storageService } from '../lib/storage';
import { NavScreen, formCategoryFor, getLocalProfiles, filterGroup } from './indicaapt/shared';
import { Sidebar, MobileBottomNav, MobileHeader } from './shared';
import FeedSection from './indicaapt/FeedSection';
import DiscoveryColumn from './indicaapt/DiscoveryColumn';
import EditModal from './indicaapt/EditModal';
import DeleteModal from './indicaapt/DeleteModal';
import Toast from './indicaapt/Toast';
import Lightbox from './indicaapt/Lightbox';

interface IndicaAptScreenProps {
  recommendations: Recommendation[];
  userProfile: UserProfile;
  loading?: boolean;
  error?: string | null;
  onAddRecommendation: (rec: Recommendation) => void;
  onEditRecommendation: (rec: Recommendation) => void;
  onDeleteRecommendation: (id: string) => void;
  onToggleLike: (id: string) => void;
  onAddComment: (id: string, comment: OcorrenciaComment) => void;
  onToggleSave: (id: string) => void;
  onToggleHide: (id: string) => void;
  onIncrementViews: (ids: string[]) => void;
  onRetry: () => void;
  onNavigate: (screen: NavScreen, transition: 'none' | 'push') => void;
}

export default function IndicaAptScreen({
  recommendations,
  userProfile,
  loading = false,
  error = null,
  onAddRecommendation,
  onEditRecommendation,
  onDeleteRecommendation,
  onToggleLike,
  onAddComment,
  onToggleSave,
  onToggleHide,
  onIncrementViews,
  onRetry,
  onNavigate,
}: IndicaAptScreenProps) {
  const isAdmin = userProfile.isAdmin !== false && (userProfile.role === 'Administrador' || userProfile.role === 'Síndico' || userProfile.isAdmin === true);
  const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';

  // Feed state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('TODOS');
  const [sortBy, setSortBy] = useState('recentes');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [cardMenuId, setCardMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedTexts, setExpandedTexts] = useState<Set<string>>(new Set());
  const [endorsersOpen, setEndorsersOpen] = useState<string | null>(null);

  // Composer state
  const [composerFocused, setComposerFocused] = useState(false);
  const [draftComment, setDraftComment] = useState('');
  const [draftProvider, setDraftProvider] = useState('');
  const [draftCategory, setDraftCategory] = useState('GASTRONOMIA');
  const [draftCustomCategory, setDraftCustomCategory] = useState('');
  const [draftRating, setDraftRating] = useState(5);
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [draftLink, setDraftLink] = useState('');
  const [draftLinkText, setDraftLinkText] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [composerError, setComposerError] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const composerFileRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);
  const [editProvider, setEditProvider] = useState('');
  const [editCategory, setEditCategory] = useState('GASTRONOMIA');
  const [editCustomCategory, setEditCustomCategory] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editLink, setEditLink] = useState('');
  const [editLinkText, setEditLinkText] = useState('');
  const [editAddingImages, setEditAddingImages] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Views: increment once per post per session
  const viewedIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const unseen = recommendations.filter(r => !viewedIds.current.has(r.id)).map(r => r.id);
    if (unseen.length === 0) return;
    unseen.forEach(id => viewedIds.current.add(id));
    onIncrementViews(unseen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Close modals with Escape (accessibility)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDeleteConfirmId(null);
        setLightboxImage(null);
        setCardMenuId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isOwn = (rec: Recommendation) =>
    rec.apartment === userProfile.apartmentNumber || rec.authorName === userProfile.fullName;

  const isHiddenFromMe = (rec: Recommendation) => (rec.hiddenBy || []).includes(userKey);

  const visibleRecs = recommendations.filter(rec => !isHiddenFromMe(rec));

  const filteredRecs = visibleRecs.filter(rec => {
    const q = searchTerm.trim().toLowerCase();
    const haystack = [
      rec.providerName,
      rec.comment,
      rec.category,
      rec.authorName || '',
      rec.apartment || '',
    ].join(' ').toLowerCase();
    const matchesSearch = !q || haystack.includes(q);
    const isFav = (rec.savedBy || []).includes(userKey);
    const isMine = isOwn(rec);
    let matchesCat = true;
    if (activeFilter === 'FAVORITOS') matchesCat = isFav;
    else if (activeFilter === 'MINHAS') matchesCat = isMine;
    else if (activeFilter !== 'TODOS') matchesCat = filterGroup(rec.category) === activeFilter;
    return matchesSearch && matchesCat;
  });

  const sortedRecs = [...filteredRecs].sort((a, b) => {
    switch (sortBy) {
      case 'recomendados':
        return (b.likes || 0) - (a.likes || 0);
      case 'comentados':
        return (b.comments || []).length - (a.comments || []).length;
      case 'salvos':
        return (b.savedBy || []).length - (a.savedBy || []).length;
      default: {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }
    }
  });

  // Discovery data
  const topRecs = [...visibleRecs].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  const savedRecs = visibleRecs.filter(r => (r.savedBy || []).includes(userKey));
  const myCount = recommendations.filter(isOwn).length;
  const totalLikes = recommendations.reduce((s, r) => s + (r.likes || 0), 0);

  // Resident directory for endorser avatars/names
  const localProfiles = getLocalProfiles();
  const avatarByApt: Record<string, string> = {};
  const nameByApt: Record<string, string> = {};
  recommendations.forEach(r => {
    if (r.apartment) {
      if (r.authorAvatar) avatarByApt[r.apartment] = r.authorAvatar;
      if (r.authorName) nameByApt[r.apartment] = r.authorName;
    }
  });
  if (userProfile.avatar) avatarByApt[userProfile.apartmentNumber] = userProfile.avatar;
  if (userProfile.fullName) nameByApt[userProfile.apartmentNumber] = userProfile.fullName;

  // Composer
  const composerExpanded = composerFocused || draftComment.length > 0 || draftProvider.length > 0 || draftImages.length > 0 || draftLink.length > 0;

  const focusComposer = () => {
    setComposerFocused(true);
    setComposerError(null);
    requestAnimationFrame(() => {
      composerRef.current?.focus();
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleComposerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadingImg(true);
    setUploadError('');
    for (const file of Array.from(files)) {
      try {
        const url = await storageService.uploadRecommendationImage(file);
        setDraftImages(prev => [...prev, url]);
      } catch (err: any) {
        console.error('Erro ao fazer upload da imagem:', err);
        setUploadError(err?.message || 'Falha ao enviar imagem.');
      }
    }
    setUploadingImg(false);
    e.target.value = '';
  };

  const resetComposer = () => {
    setDraftComment('');
    setDraftProvider('');
    setDraftCategory('GASTRONOMIA');
    setDraftCustomCategory('');
    setDraftRating(5);
    setDraftImages([]);
    setDraftLink('');
    setDraftLinkText('');
    setUploadError('');
    setComposerError(null);
    setComposerFocused(false);
    if (composerFileRef.current) composerFileRef.current.value = '';
  };

  const handleComposerPublish = () => {
    const comment = draftComment.trim();
    const provider = draftProvider.trim();
    if (!comment || !provider) {
      setComposerError(comment && !provider ? 'Conte para quem é a indicação.' : 'Escreva por que você recomenda.');
      return;
    }
    const finalCategory = draftCategory === 'OUTROS' && draftCustomCategory.trim()
      ? draftCustomCategory.trim().toUpperCase()
      : draftCategory;
    const created: Recommendation = {
      id: `rec-${Date.now()}`,
      apartment: userProfile.apartmentNumber || 'Seu Apartamento',
      authorName: userProfile.fullName || 'Morador',
      authorAvatar: userProfile.avatar || '',
      authorRole: userProfile.role || 'Morador',
      providerName: provider,
      category: finalCategory,
      comment,
      rating: draftRating,
      images: draftImages.length > 0 ? draftImages : undefined,
      link: draftLink || undefined,
      linkText: draftLinkText || undefined,
      date: 'Postado agora mesmo',
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
      views: 1,
      viewedBy: [userKey],
    };
    onAddRecommendation(created);
    resetComposer();
    setToast('Indicação publicada com sucesso!');
  };

  // Edit modal
  const openEdit = (rec: Recommendation) => {
    const { select, custom } = formCategoryFor(rec.category);
    setEditingRec(rec);
    setEditProvider(rec.providerName);
    setEditCategory(select);
    setEditCustomCategory(custom);
    setEditComment(rec.comment);
    setEditRating(rec.rating);
    setEditImages(rec.images || []);
    setEditLink(rec.link || '');
    setEditLinkText(rec.linkText || '');
    setIsEditModalOpen(true);
  };

  const handleEditImageRemove = (img: string) => {
    setEditImages(prev => prev.filter(i => i !== img));
  };

  const handleEditImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setEditAddingImages(true);
    for (const file of Array.from(files)) {
      try {
        const url = await storageService.uploadRecommendationImage(file);
        setEditImages(prev => [...prev, url]);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setEditImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    setEditAddingImages(false);
    e.target.value = '';
  };

  const handleEditRatingChange = (value: number) => {
    setEditRating(value);
    setEditingRec(prev => prev ? { ...prev, rating: value } : prev);
  };

  const handleSaveEdit = () => {
    if (!editingRec) return;
    const finalCategory = editCategory === 'OUTROS' && editCustomCategory.trim()
      ? editCustomCategory.trim().toUpperCase()
      : editCategory;
    const updated: Recommendation = {
      ...editingRec,
      providerName: editProvider,
      category: finalCategory,
      comment: editComment,
      rating: editRating,
      images: editImages.length > 0 ? editImages : undefined,
      link: editLink || undefined,
      linkText: editLinkText || undefined,
    };
    onEditRecommendation(updated);
    setIsEditModalOpen(false);
  };

  // Interactions
  const handleToggleFavorite = (id: string) => {
    const alreadySaved = (recommendations.find(r => r.id === id)?.savedBy || []).includes(userKey);
    onToggleSave(id);
    setToast(alreadySaved ? 'Indicação removida das salvas.' : 'Indicação salva!');
  };

  const handleHide = (rec: Recommendation) => {
    onToggleHide(rec.id);
    setToast('Indicação ocultada do seu feed.');
  };

  const toggleComments = (id: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleText = (id: string) => {
    setExpandedTexts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendComment = (rec: Recommendation) => {
    const text = (commentDrafts[rec.id] || '').trim();
    if (!text) return;
    const comment: OcorrenciaComment = {
      id: `cmt-${Date.now()}`,
      authorName: userProfile.fullName || 'Morador',
      avatar: userProfile.avatar || '',
      apartment: userProfile.apartmentNumber || 'Apartamento ?',
      comment: text,
      createdAt: new Date().toISOString(),
    };
    onAddComment(rec.id, comment);
    setCommentDrafts(prev => ({ ...prev, [rec.id]: '' }));
  };

  const handleShare = async (rec: Recommendation) => {
    const text = `${rec.providerName} foi recomendado por ${rec.apartment} no IndicaApt:\n"${rec.comment}"`;
    try {
      if (navigator.share) {
        await navigator.share({ title: rec.providerName, text });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setToast('Indicação copiada. Cole onde quiser compartilhar.');
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col pb-20 md:pb-0 md:pl-16 xl:pl-60">

      {/* Sidebar */}
      <Sidebar activeScreen="indica_apt" isAdmin={isAdmin} onNavigate={onNavigate} />

      {/* Mobile Header */}
      <MobileHeader
        title="IndicaApt"
        subtitle="Indique e Ganhe"
        userProfile={userProfile}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,700px)_300px] lg:justify-center gap-6">

          {/* Feed column */}
          <FeedSection
            searchTerm={searchTerm}
            activeFilter={activeFilter}
            sortBy={sortBy}
            loading={loading}
            error={error}
            recommendations={recommendations}
            sortedRecs={sortedRecs}
            filteredRecs={filteredRecs}
            hasAnyRecs={recommendations.length > 0}
            composerExpanded={composerExpanded}
            userProfile={userProfile}
            userKey={userKey}
            expandedComments={expandedComments}
            commentDrafts={commentDrafts}
            expandedTexts={expandedTexts}
            endorsersOpen={endorsersOpen}
            cardMenuId={cardMenuId}
            localProfiles={localProfiles}
            nameByApt={nameByApt}
            avatarByApt={avatarByApt}
            onSearchChange={setSearchTerm}
            onFilterChange={setActiveFilter}
            onSortChange={setSortBy}
            onFocusComposer={focusComposer}
            composerComment={draftComment}
            composerProvider={draftProvider}
            composerCategory={draftCategory}
            composerCustomCategory={draftCustomCategory}
            composerRating={draftRating}
            composerImages={draftImages}
            composerLink={draftLink}
            composerLinkText={draftLinkText}
            uploadingImg={uploadingImg}
            uploadError={uploadError}
            composerError={composerError}
            composerRef={composerRef}
            composerFileRef={composerFileRef}
            onComposerCommentChange={(v) => { setDraftComment(v); if (composerError) setComposerError(null); }}
            onComposerProviderChange={(v) => { setDraftProvider(v); if (composerError) setComposerError(null); }}
            onComposerCategoryChange={setDraftCategory}
            onComposerCustomCategoryChange={setDraftCustomCategory}
            onComposerRatingChange={setDraftRating}
            onComposerRemoveImage={(idx) => setDraftImages(prev => prev.filter((_, i) => i !== idx))}
            onComposerToggleLink={() => setDraftLink(draftLink ? '' : 'https://')}
            onComposerLinkChange={setDraftLink}
            onComposerLinkTextChange={setDraftLinkText}
            onComposerAddImages={handleComposerImageUpload}
            onComposerReset={resetComposer}
            onComposerPublish={handleComposerPublish}
            onToggleLike={onToggleLike}
            onToggleComments={toggleComments}
            onToggleText={toggleText}
            onToggleEndorsers={(id) => setEndorsersOpen(endorsersOpen === id ? null : id)}
            onToggleMenu={(id) => setCardMenuId(cardMenuId === id ? null : id)}
            onEdit={openEdit}
            onHide={handleHide}
            onAskDelete={(id) => setDeleteConfirmId(id)}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onCommentChange={(id, v) => setCommentDrafts(prev => ({ ...prev, [id]: v }))}
            onSendComment={handleSendComment}
            onOpenImage={setLightboxImage}
            onRetry={onRetry}
          />

          {/* Discovery column */}
          <DiscoveryColumn
            topRecs={topRecs}
            savedRecs={savedRecs}
            myCount={myCount}
            totalRecs={recommendations.length}
            totalLikes={totalLikes}
            onSearch={(term) => { setSearchTerm(term); setActiveFilter('TODOS'); }}
            onFilter={(cat) => { setActiveFilter(cat); setSearchTerm(''); }}
            onClear={() => { setActiveFilter('TODOS'); setSearchTerm(''); }}
            onFocusComposer={focusComposer}
          />
        </div>
      </main>

      {/* Edit modal */}
      <EditModal
        isOpen={isEditModalOpen}
        provider={editProvider}
        category={editCategory}
        customCategory={editCustomCategory}
        comment={editComment}
        rating={editRating}
        images={editImages}
        link={editLink}
        linkText={editLinkText}
        addingImages={editAddingImages}
        onProviderChange={setEditProvider}
        onCategoryChange={setEditCategory}
        onCustomCategoryChange={setEditCustomCategory}
        onCommentChange={setEditComment}
        onRatingChange={handleEditRatingChange}
        onRemoveImage={handleEditImageRemove}
        onAddImages={handleEditImageAdd}
        onLinkChange={setEditLink}
        onLinkTextChange={setEditLinkText}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Delete confirmation */}
      <DeleteModal
        deleteConfirmId={deleteConfirmId}
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            onDeleteRecommendation(deleteConfirmId);
            setDeleteConfirmId(null);
            setToast('Indicação excluída.');
          }
        }}
      />

      {/* Mobile floating CTA */}
      {!composerExpanded && (
        <button
          onClick={focusComposer}
          title="Fazer uma indicação"
          aria-label="Fazer uma indicação"
          className="fixed bottom-20 right-4 z-[45] md:hidden w-14 h-14 rounded-full bg-[#8C7364] hover:bg-[#7A6355] active:bg-[#685346] active:scale-[0.96] text-white shadow-xl flex items-center justify-center transition-colors cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Mobile bottom nav */}
      <MobileBottomNav activeScreen="indica_apt" isAdmin={isAdmin} onNavigate={onNavigate} />

      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Image lightbox */}
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

    </div>
  );
}
