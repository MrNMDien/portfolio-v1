/* =========================================================================
   parallax.js — MOTION.md §7 — [data-parallax]

   Ghi biến CSS `--parallax-y` chứ không transform trực tiếp phần tử: motion.css
   dùng biến đó cho `.media::before` (mảng gradient bên trong khung, khung đứng
   yên) và cho `.hero__wash`. Chỉ transform/opacity, không đụng layout.

   Biên độ ±8% chiều cao phần tử, hệ số data-parallax="0.15" là mốc chuẩn.
   ========================================================================= */

import { gsap, prefersReducedMotion, EASE } from './env.js';

const BASE_FACTOR = 0.15;
const BASE_RANGE = 0.08; // ±8%

export function initParallax() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const factor = parseFloat(el.dataset.parallax) || BASE_FACTOR;
    const scale = (factor / BASE_FACTOR) * BASE_RANGE;

    let amount = 0;
    const measure = () => {
      amount = el.offsetHeight * scale;
    };
    measure();

    const state = { t: 1 };
    const write = () => el.style.setProperty('--parallax-y', `${(state.t * amount).toFixed(2)}px`);
    write();

    gsap.fromTo(
      state,
      { t: 1 },
      {
        t: -1,
        ease: EASE.none,
        onUpdate: write,
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            write();
          },
        },
      },
    );
  });
}
