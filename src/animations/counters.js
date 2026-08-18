/* =========================================================================
   counters.js — MOTION.md §5 (Impact) + tiện ích countUp dùng chung

   QUAN TRỌNG: [data-counter] chỉ bọc PHẦN CHỮ SỐ. Dấu `+` là span anh em
   aria-hidden — không bao giờ ghi đè innerHTML của cả `.stat__value`.
   `data-counter-pad="2"` → 04 / 05.
   ========================================================================= */

import { gsap, ScrollTrigger, prefersReducedMotion, DUR, EASE } from './env.js';

/** Đếm số vào đúng một node text, giữ nguyên mọi thứ xung quanh. */
export function countUp(el, target, { pad = 0, duration = DUR.counter, ease = EASE.soft, delay = 0 } = {}) {
  if (!el) return null;

  const format = (n) => {
    const value = String(Math.round(n));
    return pad > 0 ? value.padStart(pad, '0') : value;
  };

  if (prefersReducedMotion()) {
    el.textContent = format(target);
    return null;
  }

  const state = { v: 0 };
  el.textContent = format(0);

  return gsap.to(state, {
    v: target,
    duration,
    ease,
    delay,
    snap: { v: 1 },
    onUpdate: () => {
      el.textContent = format(state.v);
    },
  });
}

export function initCounters() {
  const section = document.querySelector('.impact');
  const grid = document.querySelector('.impact__grid');
  if (!section || !grid) return;

  const reduced = prefersReducedMotion();
  const stats = Array.from(grid.querySelectorAll('.stat'));

  const items = stats.map((stat) => ({
    value: stat.querySelector('.stat__value'),
    counter: stat.querySelector('[data-counter]'),
    meta: [stat.querySelector('.stat__unit'), stat.querySelector('.stat__note')].filter(Boolean),
  }));

  if (!reduced) {
    items.forEach(({ value, counter, meta }) => {
      if (counter) {
        const pad = Number(counter.dataset.counterPad || 0);
        counter.textContent = pad > 0 ? '0'.repeat(pad) : '0';
      }
      gsap.set(value, { autoAlpha: 0, y: 28 });
      gsap.set(meta, { autoAlpha: 0, y: 16 });
    });
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      // Line ngăn cách: scaleX 0 → 1 từ trái, 0.8s, cùng lúc counter chạy.
      grid.classList.add('is-ruled');

      items.forEach(({ value, counter, meta }, i) => {
        const offset = i * 0.08;

        if (!reduced) {
          gsap.to(value, {
            autoAlpha: 1,
            y: 0,
            duration: DUR.fadeUp,
            ease: EASE.soft,
            delay: offset,
          });
          gsap.to(meta, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: EASE.soft,
            delay: offset + 0.2,
            stagger: 0.04,
          });
        }

        if (counter) {
          countUp(counter, Number(counter.dataset.counter || 0), {
            pad: Number(counter.dataset.counterPad || 0),
            delay: offset,
          });
        }
      });
    },
  });
}
