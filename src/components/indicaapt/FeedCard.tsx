import { motion, AnimatePresence } from 'motion/react';
import {
  MoreVertical,
  EyeOff,
  Heart,
  ThumbsUp,
  Check,
  MessageSquare,
  Bookmark,
  Share2,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Recommendation, UserProfile } from '../../types';
import {
  Avatar,
  EndorserAvatar,
  ImageCarousel,
  aptoLabel,
  formatRelativeTime,
  recommendationType,
  categoryDisplay,
  categoryStyle,
  shortApt,
} from './shared';

interface FeedCardProps {
  rec: Recommendation;
  userKey: string;
  userProfile: UserProfile;
  expanded: boolean;
  textExpanded: boolean;
  endorsersOpen: boolean;
  cardMenuOpen: boolean;
  commentDraft: string;
  localProfiles: Record<string, UserProfile>;
  nameByApt: Record<string, string>;
  avatarByApt: Record<string, string>;
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
}

export default function FeedCard({
  rec,
  userKey,
  userProfile,
  expanded,
  textExpanded,
  endorsersOpen,
  cardMenuOpen,
  commentDraft,
  localProfiles,
  nameByApt,
  avatarByApt,
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
}: FeedCardProps) {
  const isOwner =
    rec.apartment === userProfile.apartmentNumber || rec.authorName === userProfile.fullName;
  const isFav = (rec.savedBy || []).includes(userKey);
  const liked = (rec.likedBy || []).includes(userKey);
  const likes = rec.likes || 0;
  const likedBy = rec.likedBy || [];
  const comments = rec.comments || [];
  const style = categoryStyle(rec.category);
  const isLongComment = rec.comment.length > 200 || (rec.comment.match(/\n/g) || []).length > 3;
  const endorsers = likedBy.map(k => ({
    key: k,
    name: nameByApt[k] || localProfiles[k]?.fullName || (k === userKey ? userProfile.fullName : shortApt(k)),
    avatar: avatarByApt[k] || localProfiles[k]?.avatar || (k === userKey ? userProfile.avatar || '' : ''),
  }));
  const endorserCount = endorsers.length > 0 ? endorsers.length : likes;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border-[1px] border-[#EAE3D5] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(58,38,16,0.05)]"
    >
      {/* Post header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={rec.authorName}
            apartment={rec.apartment}
            src={rec.authorAvatar}
            className="w-10 h-10 text-base shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="font-extrabold text-xs text-[#3E342F] truncate">
                {rec.authorName || 'Morador(a)'}
              </p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-[#F5F2EB] text-[#8C7364] border border-[#EAE3D5] text-[8px] font-extrabold uppercase tracking-wider shrink-0">
                {rec.authorRole || 'Morador'}
              </span>
            </div>
            <p className="text-xs text-[#A6978A] font-semibold truncate mt-0.5">
              {aptoLabel(rec.apartment)} · {formatRelativeTime(rec.createdAt) || rec.date}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => onToggleMenu(rec.id)}
                aria-label="Abrir opções da indicação"
                aria-expanded={cardMenuOpen}
                className="p-2 hover:bg-[#F5F2EB] rounded-full transition-colors cursor-pointer text-[#A6978A] hover:text-[#3E342F]"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {cardMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-1 w-44 bg-white border border-[#EAE3D5] rounded-xl shadow-xl p-1.5 z-20 flex flex-col gap-0.5"
                  >
                    <button
                      onClick={() => onEdit(rec)}
                      className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer"
                    >
                      Editar indicação
                    </button>
                    <button
                      onClick={() => onHide(rec)}
                      className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer flex items-center gap-2"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      Ocultar indicação
                    </button>
                    <div className="h-px bg-[#F5F2EB] my-0.5" />
                    <button
                      onClick={() => onAskDelete(rec.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      Excluir indicação
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FCE8EF] text-[#C2185B] border border-[#F8C9DC] text-[9px] font-extrabold tracking-wider uppercase">
            <Heart className="w-3 h-3 fill-current" />
            {recommendationType(rec)}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border ${style.chip}`}>
            {categoryDisplay(rec.category)}
          </span>
        </div>

        <h4 className="font-display font-semibold text-xl text-[#3E342F] leading-tight">
          {rec.providerName}
        </h4>

        <p className={`text-sm text-[#6E6157] leading-relaxed whitespace-pre-line max-w-[62ch] ${isLongComment && !textExpanded ? 'line-clamp-5' : ''}`}>
          {rec.comment}
        </p>

        {isLongComment && (
          <button
            onClick={() => onToggleText(rec.id)}
            className="text-[11px] font-bold text-[#8C7364] hover:text-[#3E342F] flex items-center gap-1 cursor-pointer"
          >
            {textExpanded ? 'Ver menos' : 'Ver mais'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${textExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Images */}
        {rec.images && rec.images.length > 0 && (
          <ImageCarousel images={rec.images} onOpen={onOpenImage} />
        )}

        {/* Link */}
        {rec.link && (
          <a
            href={rec.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#8C7364]/10 hover:bg-[#8C7364]/20 text-[#8C7364] border border-[#8C7364]/25 rounded-full text-[10px] font-bold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            {rec.linkText ? `Abrir: ${rec.linkText}` : 'Abrir o link.'}
          </a>
        )}
      </div>

      {/* Social proof: endorsers */}
      {endorserCount > 0 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => onToggleEndorsers(rec.id)}
            aria-expanded={endorsersOpen}
            className="w-full flex items-center justify-between gap-3 bg-[#FBF9F6] hover:bg-[#F5F2EB] border border-[#8C7364]/25 hover:border-[#8C7364]/40 rounded-2xl px-4 py-3 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex -space-x-2.5 shrink-0">
                {endorsers.slice(0, 4).map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full ring-2 ring-[#FBF9F6] overflow-hidden shrink-0">
                    <EndorserAvatar name={e.name} src={e.avatar} className="w-full h-full text-[10px]" />
                  </div>
                ))}
                {endorsers.length > 4 && (
                  <div className="w-8 h-8 rounded-full ring-2 ring-[#FBF9F6] bg-[#8C7364] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    +{endorsers.length - 4}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#3E342F] truncate">
                  <span className="text-[#8C7364] text-sm">{endorserCount}</span>{' '}
                  {endorserCount === 1 ? 'morador' : 'moradores'} também recomendam
                </p>
                <p className="text-[10px] text-[#A6978A] font-semibold mt-0.5 flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 shrink-0" />
                  Rede de confiança do Oslo
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#A6978A] shrink-0 transition-transform ${endorsersOpen ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence>
            {endorsersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-white border border-[#EAE3D5] rounded-2xl overflow-hidden">
                  {endorsers.map(e => (
                    <div key={e.key} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[#F5F2EB] last:border-0">
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                        <EndorserAvatar name={e.name} src={e.avatar} className="w-full h-full text-[9px]" />
                      </div>
                      <span className="text-xs font-bold text-[#3E342F] truncate">
                        {e.name}
                      </span>
                      <span className="text-[10px] text-[#A6978A] font-semibold truncate ml-auto">
                        {e.key === userKey ? 'Você' : e.key}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action bar */}
      <div className="px-3 py-2 border-t border-[#F5F2EB] flex items-center gap-1 bg-[#FBF9F6]/40">
        <div className="flex-1 grid grid-cols-3 gap-1">
          <motion.button
            onClick={() => onToggleLike(rec.id)}
            whileTap={{ scale: 0.95 }}
            aria-pressed={liked}
            className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
              liked
                ? 'bg-[#8C7364] text-white shadow-sm'
                : 'text-[#8C7364] hover:bg-[#8C7364]/10'
            }`}
          >
            <motion.span
              key={liked ? 'endorse-on' : 'endorse-off'}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="flex items-center gap-1.5"
            >
              {liked
                ? <Check className="w-4 h-4 shrink-0" />
                : <ThumbsUp className="w-4 h-4 shrink-0" />}
              <span className="truncate">{liked ? '✓ Você também recomenda' : 'Também recomendo'}</span>
            </motion.span>
            {likes > 0 && (
              <motion.span
                key={`${rec.id}-likes-${likes}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold leading-none ${liked ? 'bg-white/25 text-white' : 'bg-[#8C7364] text-white'}`}
              >
                {likes}
              </motion.span>
            )}
          </motion.button>
          <motion.button
            onClick={() => onToggleComments(rec.id)}
            whileTap={{ scale: 0.95 }}
            aria-expanded={expanded}
            className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
              expanded ? 'text-[#8C7364]' : 'text-[#A6978A] hover:text-[#8C7364] hover:bg-[#F5F2EB]'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span className="truncate">Comentar</span>
            {comments.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold leading-none bg-[#EAE3D5] text-[#8C7364]">
                {comments.length}
              </span>
            )}
          </motion.button>
          <motion.button
            onClick={() => onToggleFavorite(rec.id)}
            whileTap={{ scale: 0.95 }}
            aria-pressed={isFav}
            className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
              isFav ? 'text-[#8C7364]' : 'text-[#A6978A] hover:text-[#8C7364] hover:bg-[#F5F2EB]'
            }`}
          >
            <motion.span
              key={isFav ? 'saved-on' : 'saved-off'}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="flex items-center gap-1.5"
            >
              <Bookmark className={`w-4 h-4 shrink-0 ${isFav ? 'fill-current' : ''}`} />
              <span className="truncate">{isFav ? 'Salvo' : 'Salvar'}</span>
            </motion.span>
          </motion.button>
        </div>
        <div className="self-stretch flex items-center ml-0.5 pl-0.5 border-l border-[#EAE3D5]">
          <button
            onClick={() => onShare(rec)}
            title="Compartilhar"
            aria-label="Compartilhar indicação"
            className="p-2 rounded-lg text-[#A6978A] hover:text-[#8C7364] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comments */}
      <div className="px-5">
        {comments.length > 0 && !expanded && (
          <button
            onClick={() => onToggleComments(rec.id)}
            aria-expanded={expanded}
            className="w-full py-2.5 text-left text-[10px] font-bold text-[#8C7364] hover:text-[#3E342F] cursor-pointer flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {comments.length} comentário{comments.length === 1 ? '' : 's'}
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
                {comments.map(c => (
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
                      aria-label="Escreva um comentário"
                      value={commentDraft}
                      onChange={e => onCommentChange(rec.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') onSendComment(rec); }}
                      className="flex-1 px-3.5 py-2 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                    />
                    <button
                      onClick={() => onSendComment(rec)}
                      disabled={!commentDraft.trim()}
                      className="h-9 px-3 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      Enviar
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
}
