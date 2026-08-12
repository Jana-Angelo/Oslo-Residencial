import { Flame, ChevronRight, Bookmark, Sparkles, Users, Info, Plus, Heart, CheckCircle2 } from 'lucide-react';
import { Recommendation } from '../../types';
import { categoryStyle, categoryFriendly, categoryLabel } from './shared';

interface DiscoveryColumnProps {
  topRecs: Recommendation[];
  savedRecs: Recommendation[];
  topCats: [string, number][];
  myCount: number;
  totalRecs: number;
  totalLikes: number;
  onSearch: (term: string) => void;
  onFilter: (cat: string) => void;
  onClear: () => void;
  onFocusComposer: () => void;
}

export default function DiscoveryColumn({
  topRecs,
  savedRecs,
  topCats,
  myCount,
  totalRecs,
  totalLikes,
  onSearch,
  onFilter,
  onClear,
  onFocusComposer,
}: DiscoveryColumnProps) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
      {/* Trending */}
      <div className="bg-white border border-[#EFEBE7] rounded-2xl p-5 shadow-[0_2px_16px_rgba(58,38,16,0.05)]">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <h3 className="text-xs font-bold text-[#3E342F]">Em alta no condomínio</h3>
          </div>
          {topRecs.length > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] font-extrabold text-[#8C7364] hover:text-[#3E342F] cursor-pointer"
            >
              Ver todos
            </button>
          )}
        </div>

        {topRecs.length > 0 ? (
          <div className="space-y-3">
            {topRecs.map((rec, i) => {
              const style = categoryStyle(rec.category);
              return (
                <button
                  key={rec.id}
                  onClick={() => onSearch(rec.providerName)}
                  className="w-full group flex items-center gap-3 rounded-xl hover:bg-[#F7F4F0] transition-colors cursor-pointer text-left"
                >
                  <span className="w-5 h-5 rounded-full bg-[#F6F0EB] text-[#8C7364] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#FBF9F6] shrink-0 border border-[#EAE3D5] flex items-center justify-center">
                    {rec.images && rec.images.length > 0 ? (
                      <img src={rec.images[0]} alt={rec.providerName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#8C7364]">{style.icon}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-[#3E342F] truncate">{rec.providerName}</p>
                    <p className="text-[10px] text-[#A6978A] font-semibold truncate mt-0.5">{categoryFriendly(rec.category)}</p>
                    <p className="text-[9px] font-extrabold text-rose-500 flex items-center gap-0.5 mt-0.5">
                      <Heart className="w-2.5 h-2.5 fill-current" />
                      <span>{rec.likes || 0} {rec.likes === 1 ? 'recomendação' : 'recomendações'}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#A6978A] py-4 text-center">
            As indicações mais endossadas aparecem aqui.
          </p>
        )}
      </div>

      {/* Saved */}
      <div className="bg-white border border-[#EFEBE7] rounded-2xl p-5 shadow-[0_2px_16px_rgba(58,38,16,0.05)]">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-[#8C7364]" />
            <h3 className="text-xs font-bold text-[#3E342F]">Minhas indicações salvas</h3>
          </div>
          {savedRecs.length > 0 && (
            <button
              onClick={() => onFilter('FAVORITOS')}
              className="text-[10px] font-extrabold text-[#8C7364] hover:text-[#3E342F] cursor-pointer"
            >
              Ver todas
            </button>
          )}
        </div>

        {savedRecs.length > 0 ? (
          <div className="space-y-3">
            {savedRecs.slice(0, 5).map(rec => {
              const style = categoryStyle(rec.category);
              return (
                <button
                  key={rec.id}
                  onClick={() => onSearch(rec.providerName)}
                  className="w-full group flex items-center gap-3 rounded-xl hover:bg-[#F7F4F0] transition-colors cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-[#FBF9F6] shrink-0 border border-[#EAE3D5] flex items-center justify-center">
                    {rec.images && rec.images.length > 0 ? (
                      <img src={rec.images[0]} alt={rec.providerName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#8C7364]">{style.icon}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-[#3E342F] truncate">{rec.providerName}</p>
                    <p className="text-[10px] text-[#A6978A] font-semibold truncate mt-0.5">{categoryLabel(rec.category)}</p>
                  </div>
                  <Bookmark className="w-3.5 h-3.5 text-[#8C7364] fill-[#8C7364] shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#A6978A] py-4 text-center">
            Salve indicações para consultar depois.
          </p>
        )}

        {savedRecs.length > 0 && (
          <button
            onClick={() => onFilter('FAVORITOS')}
            className="mt-4 w-full py-2 border border-[#EAE3D5] hover:bg-[#F5F2EB] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#8C7364] transition-colors cursor-pointer text-center"
          >
            Ver todas as salvas
          </button>
        )}
      </div>
    </aside>
  );
}
