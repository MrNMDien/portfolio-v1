/* =========================================================================
   quote.js — MOTION.md §9
   Nền ink trượt phủ bằng clip-path inset (0.8s power3.inOut), sau đó chữ quote
   reveal theo dòng chậm hơn bình thường (0.9s) rồi tới dòng ký tên.

   Khi có `motion`, section tạm mang nền cream (motion.css) và một lớp
   `.quote__bg` ink được chèn bằng JS để quét lên. reduced-motion → giữ nguyên
   nền ink tĩnh của Phase 1, chỉ fade chữ.
   ========================================================================= */

import { gsap, ScrollTrigger, prefersReducedMotion, DUR, EASE } from './env.js';
import { prepareReveal } from './reveal.js';

export function initQuote() {
  const section = document.querySelector('.quote');
  if (!section) return;

  const text = section.querySelector('.quote__text');
  const cite = section.querySelector('.quote__cite');
  const reduced = prefersReducedMotion();

  let bg = null;
  if (!reduced) {
    bg = document.createElement('span');
    bg.className = 'quote__bg';
    bg.setAttribute('aria-hidden', 'true');
    section.prepend(bg);
  }

  const record = prepareReveal(text);
  if (cite) gsap.set(cite, { autoAlpha: 0, y: reduced ? 0 : 20 });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter: () => {
      if (bg) {
        gsap.to(bg, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.8,
          ease: EASE.inOut,
        });
      }

      record.play(reduced ? 0 : 0.35, 0.9);

      if (cite) {
        gsap.to(cite, {
          autoAlpha: 1,
          y: 0,
          duration: reduced ? DUR.quick : DUR.fadeUp,
          ease: EASE.soft,
          delay: reduced ? 0.1 : 0.8,
        });
      }
    },
  });
}
