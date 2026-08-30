import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ThumbsUp, Image as ImageIcon } from 'lucide-react';
import { Recommendation } from '../../types';
import { SOCIAL_CATEGORY_OPTIONS } from './shared';
import { overlayPanel, overlayScrim } from '../shared/motion';

interface EditModalProps {
  isOpen: boolean;
  provider: string;
  category: string;
  customCategory: string;
  comment: string;
  rating: number;
  images: string[];
  link: string;
  linkText: string;
  addingImages: boolean;
  onProviderChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCustomCategoryChange: (v: string) => void;
  onCommentChange: (v: string) => void;
  onRatingChange: (v: number) => void;
  onRemoveImage: (img: string) => void;
  onAddImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLinkChange: (v: string) => void;
  onLinkTextChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EditModal({
  isOpen,
  provider,
  category,
  customCategory,
  comment,
  rating,
  images,
  link,
  linkText,
  addingImages,
  onProviderChange,
  onCategoryChange,
  onCustomCategoryChange,
  onCommentChange,
  onRatingChange,
  onRemoveImage,
  onAddImages,
  onLinkChange,
  onLinkTextChange,
  onClose,
  onSave,
}: EditModalProps) {
  const editFileRef = useRef<HTMLInputElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          variants={overlayScrim}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
        />
        <motion.div
          variants={overlayPanel}
          initial="initial"
          animate="animate"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-label="Editar indicação"
          className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
        >
        <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
          <h3 className="font-extrabold text-base text-[#3E342F] font-display">Editar Indicação</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">O que é indicado</label>
            <input
              type="text"
              value={provider}
              onChange={e => onProviderChange(e.target.value)}
              placeholder="Ex: Alzira Pizzaria, Eletricista Silva..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Categoria</label>
              <select
                value={category}
                onChange={e => onCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
              >
                {SOCIAL_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Avaliação</label>
              <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                {[
                  { id: 4, label: 'Recomendo', icon: ThumbsUp, selected: rating >= 4 },
                  { id: 5, label: 'Recomendo Muito', icon: Heart, selected: rating >= 5 },
                ].map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onRatingChange(option.id)}
                      aria-pressed={option.selected}
                      title={option.label}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold transition-all cursor-pointer ${option.selected
                        ? 'bg-[#967D6C] text-white border-[#967D6C] shadow-sm'
                        : 'bg-[#F5F2EB] text-[#8C7364] border-[#EAE3D5] hover:bg-[#EAE3D5]'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {category === 'OUTROS' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Nome da Categoria</label>
              <input
                type="text"
                placeholder="Ex: Pintura, Encanador..."
                value={customCategory}
                onChange={e => onCustomCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Sua indicação</label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => onCommentChange(e.target.value)}
              placeholder="Por que você recomenda?"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Link (opcional)</label>
            <input
              type="url"
              placeholder="https://exemplo.com"
              value={link}
              onChange={e => onLinkChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5DFD5] rounded-[14px] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block">Fotos</label>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-[#EAE3D5] h-20 bg-[#F5F2EB]">
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(img)}
                      aria-label={`Remover imagem ${idx + 1}`}
                      className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onAddImages}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => editFileRef.current?.click()}
              disabled={addingImages}
              className="w-full py-2.5 border border-dashed border-[#E5DFD5] hover:border-[#8C7364] hover:bg-[#F5F2EB] text-[#8C7364] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
              {addingImages ? 'Enviando...' : 'Adicionar Fotos'}
            </button>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#F5F2EB] hover:bg-[#EAE3D5] text-[#8C7364] font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!comment.trim() || !provider.trim()}
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
  );
}
