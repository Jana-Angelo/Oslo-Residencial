import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bookmark,
  ArrowUpDown,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Recommendation, UserProfile } from '../../types';
import { MAIN_FILTERS, SORT_OPTIONS } from './shared';
import Composer from './Composer';
import FeedCard from './FeedCard';

interface FeedSectionProps {
  searchTerm: string;
  activeFilter: string;
  sortBy: string;
  loading: boolean;
  error: string | null;
  recommendations: Recommendation[];
  sortedRecs: Recommendation[];
  filteredRecs: Recommendation[];
  hasAnyRecs: boolean;
  composerExpanded: boolean;
  userProfile: UserProfile;
  userKey: string;
  expandedComments: Set<string>;
  commentDrafts: Record<string, string>;
  expandedTexts: Set<string>;
  endorsersOpen: string | null;
  cardMenuId: string | null;
  localProfiles: Record<string, UserProfile>;
  nameByApt: Record<string, string>;
  avatarByApt: Record<string, string>;
  onSearchChange: (v: string) => void;
  onFilterChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onFocusComposer: () => void;
  composerComment: string;
  composerProvider: string;
  composerCategory: string;
  composerCustomCategory: string;
  composerRating: number;
  composerImages: string[];
  composerLink: string;
  composerLinkText: string;
  uploadingImg: boolean;
  uploadError: string;
  composerError: string | null;
  composerRef: React.RefObject<HTMLTextAreaElement | null>;
  composerFileRef: React.RefObject<HTMLInputElement | null>;
  onComposerCommentChange: (v: string) => void;
  onComposerProviderChange: (v: string) => void;
  onComposerCategoryChange: (v: string) => void;
  onComposerCustomCategoryChange: (v: string) => void;
  onComposerRatingChange: (v: number) => void;
  onComposerRemoveImage: (idx: number) => void;
  onComposerToggleLink: () => void;
  onComposerLinkChange: (v: string) => void;
  onComposerLinkTextChange: (v: string) => void;
  onComposerAddImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onComposerReset: () => void;
  onComposerPublish: () => void;
  onToggleLike: (id: string) => void;
  onToggleComments: (id: string) => void;
  onToggleText: (id: string) => void;
  onToggleEndorsers: (id: string) => void;
  onToggleMenu: (id: string) => void;
  onEdit: (rec: Recommendation) => void;
  onHide: (rec: Recommendation) => void;
  onAskDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onShare: (rec: Recommendation) => void;
  onCommentChange: (id: string, v: string) => void;
  onSendComment: (rec: Recommendation) => void;
  onOpenImage: (src: string) => void;
  onRetry: () => void;
}

export default function FeedSection({
  searchTerm,
  activeFilter,
  sortBy,
  loading,
  error,
  recommendations,
  sortedRecs,
  filteredRecs,
  hasAnyRecs,
  composerExpanded,
  userProfile,
  userKey,
  expandedComments,
  commentDrafts,
  expandedTexts,
  endorsersOpen,
  cardMenuId,
  localProfiles,
  nameByApt,
  avatarByApt,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onFocusComposer,
  composerComment,
  composerProvider,
  composerCategory,
  composerCustomCategory,
  composerRating,
  composerImages,
  composerLink,
  composerLinkText,
  uploadingImg,
  uploadError,
  composerError,
  composerRef,
  composerFileRef,
  onComposerCommentChange,
  onComposerProviderChange,
  onComposerCategoryChange,
  onComposerCustomCategoryChange,
  onComposerRatingChange,
  onComposerRemoveImage,
  onComposerToggleLink,
  onComposerLinkChange,
  onComposerLinkTextChange,
  onComposerAddImages,
  onComposerReset,
  onComposerPublish,
  onToggleLike,
  onToggleComments,
  onToggleText,
  onToggleEndorsers,
  onToggleMenu,
  onEdit,
  onHide,
  onAskDelete,
  onToggleFavorite,
  onShare,
  onCommentChange,
  onSendComment,
  onOpenImage,
  onRetry,
}: FeedSectionProps) {
  return (
    <div className="space-y-5 w-full">
      {/* Search + Filters */}
      <div className="space-y-4">
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="O que você está procurando? Ex.: eletricista, pizza, pet shop, restaurante..."
              aria-label="Buscar indicações"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-semibold placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
              <Search className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
            {MAIN_FILTERS.map(f => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#8C7364] text-white shadow-xs'
                      : 'bg-[#F5F2EB]/70 text-[#8C7364] hover:bg-[#EAE3D5]'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}

            <button
              onClick={() => onFilterChange('FAVORITOS')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'FAVORITOS'
                  ? 'bg-[#8C7364] text-white shadow-xs'
                  : 'bg-[#F5F2EB]/70 text-[#8C7364] hover:bg-[#EAE3D5]'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${activeFilter === 'FAVORITOS' ? 'fill-white' : 'fill-transparent'}`} />
              Salvas
            </button>

            <button
              onClick={() => onFilterChange('MINHAS')}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'MINHAS'
                  ? 'bg-[#8C7364] text-white shadow-xs'
                  : 'bg-[#F5F2EB]/70 text-[#8C7364] hover:bg-[#EAE3D5]'
              }`}
            >
              Minhas
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <span className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider shrink-0">
              Ordenar por:
            </span>
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={e => onSortChange(e.target.value)}
                aria-label="Ordenar por"
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-[#E5DFD5] rounded-full text-[10px] font-bold text-[#6E6157] focus:outline-none focus:ring-1 focus:ring-[#8C7364] cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown className="w-3 h-3 text-[#A6978A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Incentive / Create */}
      <Composer
        expanded={composerExpanded}
        comment={composerComment}
        provider={composerProvider}
        category={composerCategory}
        customCategory={composerCustomCategory}
        rating={composerRating}
        images={composerImages}
        link={composerLink}
        linkText={composerLinkText}
        uploadingImg={uploadingImg}
        uploadError={uploadError}
        composerError={composerError}
        userProfile={userProfile}
        composerRef={composerRef}
        fileRef={composerFileRef}
        onFocus={onFocusComposer}
        onCommentChange={onComposerCommentChange}
        onProviderChange={onComposerProviderChange}
        onCategoryChange={onComposerCategoryChange}
        onCustomCategoryChange={onComposerCustomCategoryChange}
        onRatingChange={onComposerRatingChange}
        onRemoveImage={onComposerRemoveImage}
        onToggleLink={onComposerToggleLink}
        onLinkChange={onComposerLinkChange}
        onLinkTextChange={onComposerLinkTextChange}
        onAddImages={onComposerAddImages}
        onReset={onComposerReset}
        onPublish={onComposerPublish}
      />

      {/* Feed */}
      <div className="space-y-5">
        <div>
          <h2 className="font-display font-semibold text-lg text-[#3E342F] leading-tight">
            Recomendações recentes
          </h2>
          <p className="text-xs text-[#8C7364] font-medium mt-0.5">
            O que seus vizinhos estão indicando.
          </p>
        </div>

        {loading && !error && (
          <div className="space-y-5" aria-label="Carregando indicações" role="status">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white border border-[#EAE3D5] rounded-2xl overflow-hidden animate-pulse">
                <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EAE3D5]" />
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-[#EAE3D5] rounded" />
                      <div className="h-2.5 w-20 bg-[#F0ECE4] rounded" />
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#F0ECE4]" />
                </div>
                <div className="px-5 pb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-24 rounded-full bg-[#EAE3D5]" />
                    <div className="h-5 w-20 rounded-full bg-[#F0ECE4]" />
                  </div>
                  <div className="h-4 w-2/3 bg-[#EAE3D5] rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-[#F0ECE4] rounded" />
                    <div className="h-3 w-5/6 bg-[#F0ECE4] rounded" />
                    <div className="h-3 w-2/3 bg-[#F0ECE4] rounded" />
                  </div>
                  <div className="h-40 rounded-xl bg-[#F0ECE4]" />
                </div>
                <div className="px-3 py-2 border-t border-[#F5F2EB] grid grid-cols-3 gap-1">
                  <div className="h-9 rounded-xl bg-[#F0ECE4]" />
                  <div className="h-9 rounded-xl bg-[#F0ECE4]" />
                  <div className="h-9 rounded-xl bg-[#F0ECE4]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10 bg-white rounded-2xl border border-red-100 p-6 space-y-3">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold text-[#3E342F]">
              Não conseguimos carregar as recomendações.
            </p>
            <p className="text-xs text-[#8C7364] max-w-xs mx-auto">
              Algo deu errado. Tente novamente.
            </p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#8C7364] hover:bg-[#7A6355] active:bg-[#685346] text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {sortedRecs.map(rec => (
            <FeedCard
              key={rec.id}
              rec={rec}
              userKey={userKey}
              userProfile={userProfile}
              expanded={expandedComments.has(rec.id)}
              textExpanded={expandedTexts.has(rec.id)}
              endorsersOpen={endorsersOpen === rec.id}
              cardMenuOpen={cardMenuId === rec.id}
              commentDraft={commentDrafts[rec.id] || ''}
              localProfiles={localProfiles}
              nameByApt={nameByApt}
              avatarByApt={avatarByApt}
              onToggleLike={onToggleLike}
              onToggleComments={onToggleComments}
              onToggleText={onToggleText}
              onToggleEndorsers={onToggleEndorsers}
              onToggleMenu={onToggleMenu}
              onEdit={onEdit}
              onHide={onHide}
              onAskDelete={onAskDelete}
              onToggleFavorite={onToggleFavorite}
              onShare={onShare}
              onCommentChange={onCommentChange}
              onSendComment={onSendComment}
              onOpenImage={onOpenImage}
            />
          ))}
        </AnimatePresence>

        {filteredRecs.length === 0 && !loading && !error && !hasAnyRecs && (
          <div className="text-center py-10 bg-white rounded-2xl border border-[#EAE3D5] p-6 space-y-4">
            <div className="w-14 h-14 bg-[#F5F2EB] rounded-2xl flex items-center justify-center text-[#8C7364] mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-extrabold text-[#3E342F]">
                Ainda não tem nenhuma indicação por aqui 👀
              </p>
              <p className="text-xs text-[#8C7364]">
                Que tal ser o primeiro a ajudar seus vizinhos?
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {[
                { label: '👷 Profissional', cat: 'PROFISSIONAIS' },
                { label: '🏪 Comércio', cat: 'COMÉRCIOS' },
                { label: '📍 Lugar', cat: 'LUGARES' },
                { label: '📦 Produto', cat: 'PRODUTOS' },
                { label: '🛠 Serviço', cat: 'SERVIÇOS' },
                { label: '✨ Outra coisa', cat: 'OUTROS' },
              ].map(opt => (
                <button
                  key={opt.cat}
                  onClick={() => { onFocusComposer(); onFilterChange(opt.cat); }}
                  className="px-3.5 py-2 rounded-full bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[10px] font-bold text-[#6E6157] transition-colors cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={onFocusComposer}
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Fazer primeira indicação
            </button>
          </div>
        )}

        {filteredRecs.length === 0 && !loading && !error && hasAnyRecs && (
          <div className="text-center py-10 bg-white rounded-2xl border border-[#EAE3D5] p-6 space-y-3">
            <div className="w-14 h-14 bg-[#F5F2EB] rounded-full flex items-center justify-center text-[#8C7364] mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-base font-extrabold text-[#3E342F]">
              Não encontramos nenhuma indicação.
            </p>
            <p className="text-xs text-[#8C7364] max-w-xs mx-auto">
              Tente buscar por outro termo ou compartilhe uma recomendação com seus vizinhos.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => { onSearchChange(''); onFilterChange('TODOS'); }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#6E6157] rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Limpar busca
              </button>
              <button
                onClick={onFocusComposer}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Fazer uma indicação
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
