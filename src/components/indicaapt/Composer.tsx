import { Sparkles, Plus, Star, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { UserProfile } from '../../types';
import { Avatar, SOCIAL_CATEGORY_OPTIONS } from './shared';

interface ComposerProps {
  expanded: boolean;
  comment: string;
  provider: string;
  category: string;
  customCategory: string;
  rating: number;
  images: string[];
  link: string;
  linkText: string;
  uploadingImg: boolean;
  uploadError: string;
  composerError: string | null;
  userProfile: UserProfile;
  composerRef: React.RefObject<HTMLTextAreaElement | null>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFocus: () => void;
  onCommentChange: (v: string) => void;
  onProviderChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCustomCategoryChange: (v: string) => void;
  onRatingChange: (v: number) => void;
  onRemoveImage: (idx: number) => void;
  onToggleLink: () => void;
  onLinkChange: (v: string) => void;
  onLinkTextChange: (v: string) => void;
  onAddImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onPublish: () => void;
}

export default function Composer({
  expanded,
  comment,
  provider,
  category,
  customCategory,
  rating,
  images,
  link,
  linkText,
  uploadingImg,
  uploadError,
  composerError,
  userProfile,
  composerRef,
  fileRef,
  onFocus,
  onCommentChange,
  onProviderChange,
  onCategoryChange,
  onCustomCategoryChange,
  onRatingChange,
  onRemoveImage,
  onToggleLink,
  onLinkChange,
  onLinkTextChange,
  onAddImages,
  onReset,
  onPublish,
}: ComposerProps) {
  return (
    <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-[0_2px_16px_rgba(58,38,16,0.05)] overflow-hidden">
      <div className="p-4">
        {!expanded && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 bg-[#8C7364]/10 text-[#8C7364] rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-extrabold text-sm text-[#3E342F] leading-tight">
                Compartilhe algo que você recomenda!
              </p>
              <p className="text-[10px] text-[#8C7364] font-medium mt-0.5">
                Ajude seus vizinhos indicando profissionais, comércios, lugares e muito mais.
              </p>
            </div>
            <button
              onClick={onFocus}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#8C7364] text-white rounded-full text-[10px] font-bold shadow-sm hover:bg-[#7A6355] active:bg-[#685346] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Fazer uma indicação
            </button>
          </div>
        )}

        {expanded && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar
                name={userProfile.fullName}
                apartment={userProfile.apartmentNumber}
                src={userProfile.avatar}
                className="w-10 h-10 text-base shrink-0"
              />
              <textarea
                ref={composerRef}
                rows={expanded ? 3 : 1}
                value={comment}
                onChange={e => onCommentChange(e.target.value)}
                onFocus={onFocus}
                placeholder="O que você recomenda aos seus vizinhos?"
                className="flex-1 px-3.5 py-2.5 bg-[#FBF9F6] border border-[#E5DFD5] rounded-[14px] text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] resize-none"
              />
            </div>

            {expanded && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">
                    Para quem/quê é a indicação?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alzira Pizzaria, Eletricista Silva, Mercado do Bosque..."
                    value={provider}
                    onChange={e => onProviderChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Categoria:</span>
                  <select
                    value={category}
                    onChange={e => onCategoryChange(e.target.value)}
                    className="px-3 py-2 bg-[#F5F2EB] text-[#8C7364] border border-transparent rounded-xl text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#8C7364] cursor-pointer"
                  >
                    {SOCIAL_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  {category === 'OUTROS' && (
                    <input
                      type="text"
                      required
                      placeholder="Nome da categoria"
                      value={customCategory}
                      onChange={e => onCustomCategoryChange(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#E5DFD5] rounded-[14px] text-[10px] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] flex-1 min-w-[140px]"
                    />
                  )}

                  <div className="flex items-center gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        aria-label={`Avaliar com ${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                        aria-pressed={star <= rating}
                        title={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                        className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-[#EAE3D5] h-20">
                        <img src={img} alt={`Prévia ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => onRemoveImage(idx)}
                          aria-label={`Remover imagem ${idx + 1}`}
                          className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {link && (
                  <input
                    type="text"
                    placeholder="Texto do link (ex: Ver site)"
                    value={linkText}
                    onChange={e => onLinkTextChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
                  />
                )}

                {composerError && <p className="text-[10px] text-red-500 font-bold">{composerError}</p>}
                {uploadError && <p className="text-[10px] text-red-500 font-bold">{uploadError}</p>}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onAddImages}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingImg}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {uploadingImg ? 'Enviando...' : 'Foto'}
                    </button>
                    <button
                      type="button"
                      onClick={onToggleLink}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                        link ? 'bg-[#8C7364] text-white' : 'bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364]'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Link
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onReset}
                      className="px-4 py-2 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={onPublish}
                      disabled={!comment.trim()}
                      className="px-5 py-2 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Publicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
