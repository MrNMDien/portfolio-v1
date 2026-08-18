/* =========================================================================
   header.js — MOTION.md §4
   Scroll xuống quá 120px → `.is-scrolled` (nền cream 92% + blur + line dưới).
   Scroll ngược lên → gỡ class, header trở lại đầy đủ.
   Hover underline của nav là CSS thuần (motion.css) — 250ms cubic-bezier.
   ========================================================================= */

import { ScrollTrigger } from './env.js';

const THRESHOLD = 120;

export function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const apply = (scroll, direction) => {
    if (scroll <= THRESHOLD) {
      header.classList.remove('is-scrolled');
      return;
    }
    if (direction === 1) header.classList.add('is-scrolled');
    else if (direction === -1) header.classList.remove('is-scrolled');
  };

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => apply(self.scroll(), self.direction),
    onRefresh: (self) => apply(self.scroll(), 1),
  });
}
