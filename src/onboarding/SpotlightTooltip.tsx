import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, Check, X } from 'lucide-react';
import type { FeatureDef } from './registry';
import { MODULE_META } from './registry';

interface Props {
  moduleId: string;
  feature: FeatureDef;
  index: number;
  total: number;
  last?: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const CARD_W = 252;
const GAP = 10;
const ARROW = 10;
const OVERLAY_LIT = 'rgba(0,0,0,0.5)';
const tooltipId = (anchor: string) => `oslo-tip-${anchor}`;

// Calm entrance — plain tween, no spring (springs caused visible wobble).
const tooltipAnim: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { type: 'tween', duration: 0.12, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.98, transition: { type: 'tween', duration: 0.1, ease: 'easeIn' } },
};

export default function SpotlightTooltip({ moduleId, feature, index, total, last = false, onComplete, onClose }: Props) {
  const [hole, setHole] = useState<{ top: number; left: number; w: number; h: number; radius: string } | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number; arrowX: number; placement: 'below' | 'above' }>({
    top: 0,
    left: 0,
    arrowX: 0,
    placement: 'below',
  });
  const [cardReady, setCardReady] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardReadyRef = useRef(false);
  const meta = MODULE_META[moduleId];

  const compute = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-onboarding="${feature.anchor}"]`);
    if (!el) return;
    el.setAttribute('aria-describedby', tooltipId(feature.anchor));

    const r = el.getBoundingClientRect();
    const cw = cardReadyRef.current ? cardRef.current?.offsetWidth || CARD_W : CARD_W;
    const ch = cardReadyRef.current ? cardRef.current?.offsetHeight || 140 : 140;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const w = Math.max(r.width, 56);
    const h = Math.max(r.height, 44);

    const ctrX = r.left + r.width / 2;
    let placement: 'below' | 'above' = 'below';
    let top = r.bottom + GAP + ARROW;
    if (top + ch > vh - 16) {
      top = r.top - ch - GAP - ARROW;
      placement = 'above';
      if (top < 16) top = Math.max(16, r.top + r.height / 2 - ch / 2);
    }
    let left = ctrX - cw / 2;
    left = Math.max(12, Math.min(left, vw - cw - 12));
    const arrowX = Math.max(left + 14, Math.min(ctrX - ARROW / 2, left + cw - 14 - ARROW));

    let radius = '12px';
    if (cardReadyRef.current) {
      try {
        radius = window.getComputedStyle(el).borderTopLeftRadius;
      } catch {
        /* keep default */
      }
    }

    setHole({ top: r.top, left: r.left, w, h, radius });
    setCardPos({ top, left, arrowX, placement });
  }, [feature.anchor, cardReady]);

  useLayoutEffect(() => {
    compute();

    const anchor = document.querySelector<HTMLElement>(`[data-onboarding="${feature.anchor}"]`);
    const ro = new ResizeObserver(compute);
    if (anchor) ro.observe(anchor);

    // Re-align after layout settles (screen transition, fonts, async data).
    const timers = [150, 400, 900].map(ms => window.setTimeout(compute, ms));

    return () => {
      ro.disconnect();
      timers.forEach(t => window.clearTimeout(t));
    };
  }, [compute, moduleId, feature]);

  // The card mounts only after `hole` is set; mark it ready so `compute`
  // re-runs with the real card size and the anchor's own corner radius.
  useLayoutEffect(() => {
    if (cardRef.current && !cardReadyRef.current) {
      cardReadyRef.current = true;
      setCardReady(true);
    }
  });

  useEffect(() => {
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      const el = document.querySelector<HTMLElement>(`[data-onboarding="${feature.anchor}"]`);
      el?.removeAttribute('aria-describedby');
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
      window.removeEventListener('keydown', onKey);
    };
  }, [compute, feature.anchor, onComplete]);

  if (!hole) return null;

  const Icon = meta.icon;
  const id = tooltipId(feature.anchor);
  const isFinal = last && index === total - 1;
  const arrowStyle =
    cardPos.placement === 'below'
      ? { top: -ARROW + 1, left: cardPos.arrowX }
      : { bottom: -ARROW + 1, left: cardPos.arrowX };

  return createPortal(
    <div className="fixed inset-0 z-[120] pointer-events-none">
      {/* Spot hole: dark scrim with a cutout on the anchor (matches its corners) */}
      <motion.div
        className="absolute"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.w,
          height: hole.h,
          borderRadius: hole.radius,
          boxShadow: `0 0 0 9999px ${OVERLAY_LIT}`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        ref={cardRef}
        id={id}
        variants={tooltipAnim}
        initial="initial"
        animate="animate"
        exit="exit"
        role="dialog"
        aria-label={feature.label}
        tabIndex={-1}
        style={{ top: cardPos.top, left: cardPos.left, width: CARD_W }}
        className="absolute pointer-events-auto bg-[#003049] text-white border border-[#0F4E6E] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.4)] px-3.5 py-2.5 focus:outline-none"
      >
        {/* Arrow (same color as tooltip => MUI/Bootstrap style) */}
        <span
          className="absolute w-[10px] h-[10px] bg-[#003049] rotate-45 rounded-[1px]"
          style={arrowStyle}
          aria-hidden
        />

        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-white/60">
            <Icon className="w-3 h-3 text-white/60" />
            {meta.label}
          </span>
          <button
            onClick={onComplete}
            aria-label="Próximo — continuar"
            className="p-0.5 text-white/45 hover:text-white hover:bg-white/10 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="font-bold text-xs text-white leading-snug">{feature.label}</h4>
        <p className="mt-0.5 text-[11px] text-white/75 leading-relaxed">{feature.tooltip}</p>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/15">
          <span className="text-[9px] font-bold text-white/50">
            {index + 1} de {total}
          </span>
          {isFinal ? (
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-1 bg-white hover:bg-white/90 text-[#003049] text-[10px] font-bold uppercase tracking-wide rounded-md px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Finalizar
              <Check className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-1 bg-white hover:bg-white/90 text-[#003049] text-[10px] font-bold uppercase tracking-wide rounded-md px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Próximo
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}