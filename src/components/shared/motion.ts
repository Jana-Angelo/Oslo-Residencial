import type { Variants, Transition } from 'motion/react';

// Apple design overlay presets (motion/react)
// Reference: apple-design skill — springs answer interruption and
// velocity better than fixed-duration tweens.

const SPRING_CRITICAL: Transition = {
  type: 'spring',
  damping: 1,
  duration: 0.38,
};

const SPRING_MOMENTUM: Transition = {
  type: 'spring',
  damping: 0.8,
  duration: 0.42,
};

const FADE: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

// Scrim: pure opacity. The panel carries the spatial story.
export const overlayScrim: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: FADE },
  exit: { opacity: 0, transition: { ...FADE, ease: 'easeIn' } },
};

// Sheet/modal panel: critically damped spring, gentle lift + settle.
// Grows from the trigger origin (transform-origin handled by caller).
export const overlayPanel: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING_CRITICAL,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// Small anchored popover (dropdowns/menus): tight, origin at trigger.
export const popoverPanel: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING_CRITICAL, duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// In-list content (feed cards, accordions): soft rise, no overshoot.
export const listItemFall: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: SPRING_CRITICAL },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: 'easeIn' } },
};

// Toast: rises from the bottom edge, settles critically.
export const toastRise: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: SPRING_CRITICAL },
  exit: { opacity: 0, y: 40, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } },
};