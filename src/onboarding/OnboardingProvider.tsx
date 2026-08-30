import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { MODULE_META, featuresForModule, type FeatureDef } from './registry';
import SpotlightTooltip from './SpotlightTooltip';
import { isOnboardingDone, isTooltipSeen, markTooltipSeen } from '../lib/onboarding';

function findAnchor(def: FeatureDef): HTMLElement | null {
  try {
    return document.querySelector<HTMLElement>(`[data-onboarding="${def.anchor}"]`);
  } catch {
    return null;
  }
}

interface Props {
  moduleId: string;
  userKey: string;
  isAdmin: boolean;
  enabled?: boolean;
  forceShow?: boolean;
  isLastModule?: boolean;
  onTourFinished?: () => void;
  onTourFinalized?: () => void;
}

export default function OnboardingProvider({ moduleId, userKey, isAdmin, enabled = true, forceShow = false, isLastModule = false, onTourFinished, onTourFinalized }: Props) {
  const [queue, setQueue] = useState<FeatureDef[]>([]);
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const completedSession = useRef(false);
  const prevModuleRef = useRef(moduleId);
  const retries = useRef(0);

  // Reset per-module flags whenever the module changes so a manual re-visit
  // re-shows the tour in forceShow (preview) mode.
  useEffect(() => {
    if (prevModuleRef.current !== moduleId) {
      prevModuleRef.current = moduleId;
      completedSession.current = false;
      retries.current = 0;
      setQueue([]);
      setIdx(0);
    }
  }, [moduleId]);

  // Recompute after each mark (localStorage changes don't trigger React state).
  const pending = useMemo(() => {
    void tick;
    if (isOnboardingDone(userKey)) return [];
    return featuresForModule(moduleId, isAdmin)
      .filter(d =>
        forceShow
          ? findAnchor(d)
          : !isTooltipSeen(userKey, moduleId, d.id) && findAnchor(d)
      )
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  }, [moduleId, isAdmin, userKey, tick, forceShow]);

  // A tooltip only disappears when the user clicks it — that marks it as seen.
  // Once marked, it is never shown again (unless forceShow preview mode).
  useEffect(() => {
    if (!enabled || !(moduleId in MODULE_META)) return;
    if (queue.length > 0) return;
    if (forceShow && completedSession.current) return;
    if (pending.length === 0) return;
    setQueue(pending);
    setIdx(0);
  }, [enabled, moduleId, pending, queue.length, forceShow]);

  // Module screens fetch their data asynchronously, so anchors may not exist
  // yet on mount. Poll briefly until they appear, then the effect above runs.
  useEffect(() => {
    if (!enabled || !(moduleId in MODULE_META)) return;
    if (queue.length > 0 || pending.length > 0) return;
    if (retries.current >= 15) return;
    const id = window.setTimeout(() => {
      retries.current += 1;
      setTick(t => t + 1);
    }, 200);
    return () => window.clearTimeout(id);
  }, [enabled, moduleId, queue.length, pending.length]);

  const advance = useCallback(() => {
    setIdx(i => {
      const current = queue[i];
      if (current && !forceShow) {
        markTooltipSeen(userKey, moduleId, [current.id]);
      }
      if (i + 1 < queue.length) {
        return i + 1;
      }
      if (forceShow) completedSession.current = true;
      setQueue([]);
      setTick(t => t + 1);
      onTourFinished?.();
      if (isLastModule) onTourFinalized?.();
      return i;
    });
  }, [queue, userKey, moduleId, forceShow, onTourFinished, onTourFinalized, isLastModule]);

  const handleComplete = useCallback(() => advance(), [advance]);
  const handleClose = useCallback(() => advance(), [advance]);

  const current = queue[idx] || null;

  return (
    <AnimatePresence>
      {current && (
        <SpotlightTooltip
          key={current.id}
          moduleId={moduleId}
          feature={current}
          index={idx}
          total={queue.length}
          last={isLastModule}
          onComplete={handleComplete}
          onClose={handleClose}
        />
      )}
    </AnimatePresence>
  );
}