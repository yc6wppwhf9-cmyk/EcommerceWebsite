import type { Variants, Transition } from 'motion/react';

/**
 * Shared motion language for the quiet palette.
 *
 * The previous animations were large and fast — scale-110/125 on hover,
 * -translate-y-3 lifts, springy pops. Big movement reads playful; restraint
 * reads expensive. Everything here is small (2–8px), slow (0.5–0.8s) and
 * eased out hard, so motion settles rather than bounces.
 *
 * Pair with useReducedMotion() at the call site — see `revealProps`.
 */

/** Expo-out. Fast departure, long settle — the curve that feels considered. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const DURATION = {
  quick: 0.35,
  base: 0.6,
  slow: 0.8,
} as const;

export const transition: Transition = { duration: DURATION.base, ease: EASE };

/** Rise-and-fade. 12px, never more — enough to read as motion, not as a jump. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE } },
};

/** Parent for lists/grids. Children trail each other by a beat. */
export const stagger = (gap = 0.07): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren: 0.05 } },
});

/**
 * Scroll reveal props. `once` so sections settle permanently instead of
 * re-animating every time the user scrolls back — replaying is what makes a
 * page feel restless.
 */
export const revealProps = (reduced: boolean | null) =>
  reduced
    ? { initial: undefined, whileInView: undefined, viewport: undefined }
    : {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once: true, amount: 0.2 },
      };
