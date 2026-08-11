import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  UtensilsCrossed,
  Wrench,
  Briefcase,
  ShoppingBag,
  MapPin,
  Package,
  Hammer,
  Zap,
  Flower2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Recommendation, UserProfile } from '../../types';

export type NavScreen = 'login' | 'caixa' | 'avisos' | 'dashboard' | 'indica_apt' | 'perfil' | 'ocorrencias';

export const SOCIAL_CATEGORY_OPTIONS = [
  { value: 'GASTRONOMIA', label: 'Gastronomia' },
  { value: 'SERVIÇOS', label: 'Serviços' },
  { value: 'PROFISSIONAIS', label: 'Profissionais' },
  { value: 'COMÉRCIOS', label: 'Comércios' },
  { value: 'LOJAS', label: 'Lojas' },
  { value: 'LUGARES', label: 'Lugares' },
  { value: 'PRODUTOS', label: 'Produtos' },
  { value: 'OUTROS', label: 'Outros' },
];
export const SOCIAL_CATEGORIES = SOCIAL_CATEGORY_OPTIONS.map(o => o.value);

export const CATEGORY_LABELS: Record<string, string> = {
  'GASTRONOMIA': 'Gastronomia',
  'SERVIÇOS': 'Serviços',
  'PROFISSIONAIS': 'Profissionais',
  'COMÉRCIOS': 'Comércios',
  'LOJAS': 'Lojas',
  'LUGARES': 'Lugares',
  'PRODUTOS': 'Produtos',
  'MARCENARIA': 'Marcenaria',
  'ELÉTRICA': 'Elétrica',
  'PAISAGISMO': 'Paisagismo',
  'OUTROS': 'Outros',
};

export const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; chip: string; dot: string }> = {
  'GASTRONOMIA': { icon: <UtensilsCrossed size={14} />, chip: 'bg-[#FFF7ED] text-[#C2571B] border-[#FDE8CF]', dot: '#F59E0B' },
  'SERVIÇOS': { icon: <Wrench size={14} />, chip: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]', dot: '#3B82F6' },
  'PROFISSIONAIS': { icon: <Briefcase size={14} />, chip: 'bg-[#F5F3FF] text-[#6D28D9] border-[#EDE9FE]', dot: '#8B5CF6' },
  'COMÉRCIOS': { icon: <Store size={14} />, chip: 'bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]', dot: '#10B981' },
  'LOJAS': { icon: <ShoppingBag size={14} />, chip: 'bg-[#FDF2F8] text-[#BE185D] border-[#FCE7F3]', dot: '#EC4899' },
  'LUGARES': { icon: <MapPin size={14} />, chip: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]', dot: '#F59E0B' },
  'PRODUTOS': { icon: <Package size={14} />, chip: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]', dot: '#64748B' },
  'MARCENARIA': { icon: <Hammer size={14} />, chip: 'bg-[#FFF7ED] text-[#9A3412] border-[#FFEDD5]', dot: '#C2571B' },
  'ELÉTRICA': { icon: <Zap size={14} />, chip: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]', dot: '#F59E0B' },
  'PAISAGISMO': { icon: <Flower2 size={14} />, chip: 'bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]', dot: '#22C55E' },
  'OUTROS': { icon: <Sparkles size={14} />, chip: 'bg-[#F5F2EB] text-[#8C7364] border-[#EAE3D5]', dot: '#A6978A' },
};

export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat.toUpperCase()] || cat;
}

export function categoryStyle(cat: string) {
  return CATEGORY_STYLES[cat.toUpperCase()] ?? CATEGORY_STYLES['OUTROS'];
}

export const MAIN_FILTERS = [
  { value: 'TODOS', label: 'Tudo' },
  { value: 'SERVIÇOS', label: 'Serviços' },
  { value: 'PROFISSIONAIS', label: 'Profissionais' },
  { value: 'COMÉRCIOS', label: 'Comércios' },
  { value: 'PRODUTOS', label: 'Produtos' },
  { value: 'LUGARES', label: 'Lugares' },
  { value: 'DICAS', label: 'Dicas' },
];

export const SORT_OPTIONS = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'recomendados', label: 'Mais recomendados' },
  { value: 'comentados', label: 'Mais comentados' },
  { value: 'salvos', label: 'Mais salvos' },
];

const CATEGORY_DISPLAY: Record<string, string> = {
  'GASTRONOMIA': '🍕 Restaurante / Fast Food',
  'SERVIÇOS': '🛠 Serviço',
  'PROFISSIONAIS': '🔧 Profissional',
  'COMÉRCIOS': '🏪 Comércio',
  'LOJAS': '🏪 Comércio',
  'LUGARES': '📍 Lugar',
  'PRODUTOS': '🛍 Produto',
  'MARCENARIA': '🪚 Marcenaria',
  'ELÉTRICA': '⚡ Elétrica',
  'PAISAGISMO': '🌿 Paisagismo',
  'DICAS': '💡 Dica',
  'OUTROS': '✨ Outros',
};

export function categoryDisplay(cat: string): string {
  return CATEGORY_DISPLAY[cat.toUpperCase()] || categoryLabel(cat);
}

export function categoryFriendly(cat: string): string {
  return categoryDisplay(cat).replace(/^\S+\s/, '');
}

export function filterGroup(cat: string): string | null {
  const c = (cat || '').toUpperCase();
  if (c === 'SERVIÇOS' || c === 'MARCENARIA' || c === 'ELÉTRICA' || c === 'PAISAGISMO') return 'SERVIÇOS';
  if (c === 'PROFISSIONAIS') return 'PROFISSIONAIS';
  if (c === 'COMÉRCIOS' || c === 'GASTRONOMIA' || c === 'LOJAS') return 'COMÉRCIOS';
  if (c === 'PRODUTOS') return 'PRODUTOS';
  if (c === 'LUGARES') return 'LUGARES';
  if (c === 'DICAS') return 'DICAS';
  return null;
}

export function recommendationType(rec: Recommendation): string {
  return (rec.rating || 0) >= 5 ? 'RECOMENDO MUITO' : 'RECOMENDO';
}

export function aptoLabel(apartment: string): string {
  const m = (apartment || '').match(/(\d+)/);
  return m ? `Apto ${m[1]}` : (apartment || 'Morador');
}

export function formCategoryFor(cat: string): { select: string; custom: string } {
  const c = (cat || '').toUpperCase();
  if (SOCIAL_CATEGORIES.includes(c)) return { select: c, custom: '' };
  return { select: 'OUTROS', custom: cat || '' };
}

export function shortApt(key: string): string {
  const m = (key || '').match(/(\d+)/);
  return m ? `Apt ${m[1]}` : (key || 'Vizinho').split(' ')[0];
}

const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function formatRelativeTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60_000) return 'agora';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `há ${minutes} min`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (date.getTime() >= startOfToday) return `há ${hours}h`;
  if (date.getTime() >= startOfToday - 86_400_000) return 'ontem';
  if (date.getTime() >= startOfToday - 6 * 86_400_000) return WEEKDAYS[date.getDay()];
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function Avatar({ name, apartment, src, className }: { name: string; apartment: string; src?: string; className?: string }) {
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

export function getLocalProfiles(): Record<string, UserProfile> {
  try {
    const saved = localStorage.getItem('oslo_user_profiles');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function EndorserAvatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  const fallback = (name || '?').trim().charAt(0).toUpperCase() || '?';
  if (src) {
    return (
      <img src={src} alt={name} className={`rounded-full object-cover ${className || 'w-7 h-7'}`} referrerPolicy="no-referrer" />
    );
  }
  return (
    <div className={`rounded-full bg-[#8C7364] text-white font-extrabold flex items-center justify-center ${className || 'w-7 h-7 text-[9px]'}`}>
      {fallback}
    </div>
  );
}

export function ImageCarousel({ images, onOpen }: { images: string[]; onOpen: (src: string) => void }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const goTo = (dir: number) => setIndex(i => (i + dir + count) % count);
  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#EAE3D5] bg-[#F5F2EB]">
      <div className="aspect-[4/3] w-full cursor-pointer" onClick={() => onOpen(images[index])}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={index}
            src={images[index]}
            alt={`Foto ${index + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>
      {count > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); goTo(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 transition-colors cursor-pointer z-10"
            title="Foto anterior"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); goTo(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 transition-colors cursor-pointer z-10"
            title="Próxima foto"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />
            ))}
          </div>
          <span className="absolute top-2 right-2 z-10 text-[9px] font-bold text-white bg-black/50 rounded-full px-2 py-0.5">
            {index + 1}/{count}
          </span>
        </>
      )}
    </div>
  );
}
