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
      <div className="bg-white border border-[#EFEBE7] rounded-2xl p-6 shadow-[0_2px_16px_rgba(58,38,16,0.05)]">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-[#C2571B]" />
          <h3 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase">Em alta no condomínio</h3>
        </div>

        {topRecs.length > 0 ? (
          <div className="space-y-1">
            {topRecs.map((rec, i) => {
              const style = categoryStyle(rec.category);
              return (
                <button
                  key={rec.id}
                  onClick={() => onSearch(rec.providerName)}
                  className="w-full group flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-[#F7F4F0] transition-colors cursor-pointer text-left"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold font-display shrink-0 ${i === 0 ? 'bg-[#FCE8EF] text-[#C2185B]' : i === 1 ? 'bg-amber-100 text-amber-700' : i === 2 ? 'bg-[#E8F5EC] text-[#2E7D4F]' : 'bg-[#F5F2EB] text-[#A6978A]'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-[#2D2D2D] truncate">{rec.providerName}</p>
                    <p className="text-[10px] text-[#A6978A] font-semibold mt-0.5 flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 truncate">
                        {style.icon}
                        {categoryFriendly(rec.category)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Heart className="w-3.5 h-3.5 text-[#C2185B] fill-current" />
                    <span className="text-xs font-extrabold text-[#C2185B]">
                      {rec.likes || 0} {rec.likes === 1 ? 'recomendação' : 'recomendações'}
                    </span>
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

        {topRecs.length > 0 && (
          <button
            onClick={onClear}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#8C7364] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
          >
            Ver todos
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Saved */}
      <div className="bg-white border border-[#EFEBE7] rounded-2xl p-6 shadow-[0_2px_16px_rgba(58,38,16,0.05)]">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-4 h-4 text-[#8C7364]" />
          <h3 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase">Minhas indicações salvas</h3>
        </div>

        {savedRecs.length > 0 ? (
          <div className="space-y-1">
            {savedRecs.slice(0, 5).map(rec => {
              const style = categoryStyle(rec.category);
              return (
                <button
                  key={rec.id}
                  onClick={() => onSearch(rec.providerName)}
                  className="w-full group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#F7F4F0] transition-colors cursor-pointer text-left"
                >
                  <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0 border ${style.chip}`}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#2D2D2D] truncate">{rec.providerName}</p>
                    <p className="text-[10px] text-[#A6978A] font-semibold truncate">{categoryLabel(rec.category)}</p>
                  </div>
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
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#8C7364] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
          >
            Ver todas as salvas
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="bg-white border border-[#EFEBE7] rounded-2xl p-6 shadow-[0_2px_16px_rgba(58,38,16,0.05)]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#8C7364]" />
          <h3 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase">Categorias em alta</h3>
        </div>

        {topCats.length > 0 ? (
          <div className="space-y-2.5">
            {topCats.map(([cat, count]) => {
              const style = categoryStyle(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onFilter(cat)}
                  className="w-full group flex items-center justify-between rounded-xl px-2 py-1 -mx-2 hover:bg-[#F7F4F0] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0 border ${style.chip}`}>
                      {style.icon}
                    </span>
                    <span className="text-[13px] font-semibold text-[#2D2D2D] truncate">{categoryLabel(cat)}</span>
                  </div>
                  <span className="text-sm font-bold text-[#A6978A] shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#A6978A] py-4 text-center">Nenhuma indicação ainda.</p>
        )}
      </div>

      {/* Community invite */}
      <div className="bg-[#8C7364] border border-[#7A6355] rounded-2xl p-6 text-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[#E8E2DC]" />
          <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#E8E2DC]">Rede de confiança</h3>
        </div>
        <p className="text-sm font-extrabold leading-snug">
          {myCount === 0
            ? 'Você ainda não indicou nada.'
            : 'Obrigado por fazer parte da rede.'}
        </p>
        <p className="text-xs text-[#E8E2DC] leading-relaxed mt-1.5">
          {myCount === 0
            ? 'Compartilhe algo bom que você descobriu e ajude um vizinho hoje.'
            : `${totalRecs} indicações já ajudaram seus vizinhos, com ${totalLikes} endossos.`}
        </p>
        <button
          onClick={onFocusComposer}
          className="mt-4 w-full py-2.5 bg-white text-[#8C7364] hover:bg-[#F5F2EB] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {myCount === 0 ? 'Fazer minha primeira indicação' : 'Indicar algo novo'}
        </button>
      </div>

      {/* About */}
      <div className="bg-[#F5F2EB]/50 border border-[#EAE3D5] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8C7364]" />
          <h3 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase">Sobre o IndicaApt</h3>
        </div>
        <p className="text-xs text-[#6E6157] leading-relaxed">
          Um vizinho encontrou algo bom e compartilhou com os outros. Quanto mais moradores recomendam, maior a
          confiança na indicação.
        </p>
        <div className="flex items-center gap-2 pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />
          <span className="text-[10px] font-semibold text-[#6E6157]">Rede privada do condomínio Oslo</span>
        </div>
      </div>
    </aside>
  );
}
