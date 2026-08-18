/* =========================================================================
   progress.js — MOTION.md §12 — thanh tiến độ 2px accent cố định trên đỉnh
   ========================================================================= */

import { gsap, prefersReducedMotion, EASE } from './env.js';

export function initProgress() {
  if (prefersReducedMotion()) return;

  const wrap = document.createElement('div');
  wrap.className = 'scroll-progress';
  wrap.setAttribute('aria-hidden', 'true');

  const bar = document.createElement('span');
  bar.className = 'scroll-progress__bar';
  wrap.appendChild(bar);
  document.body.appendChild(wrap);

  gsap.to(bar, {
    scaleX: 1,
    ease: EASE.none,
    scrollTrigger: {
      start: 0,
      end: 'max',
      scrub: 0.3,
      invalidateOnRefresh: true,
    },
  });
}
