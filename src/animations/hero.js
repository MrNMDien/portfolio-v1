/* =========================================================================
   hero.js — MOTION.md §3
   Hero KHÔNG dùng ScrollTrigger để mở: nó được preloader gọi thẳng ngay khi
   shutter bắt đầu kéo lên. initHero() chỉ chuẩn bị trạng thái ẩn và trả về
   hàm play().
   ========================================================================= */

import { gsap, ScrollTrigger, prefersReducedMotion, EASE } from './env.js';
import { prepareReveal } from './reveal.js';

export function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};

  const title = hero.querySelector('.hero__title');
  const kicker = hero.querySelector('.hero__kicker');
  const subline = hero.querySelector('.hero__subline');
  const scroll = hero.querySelector('.hero__scroll');

  const records = [
    title && { rec: prepareReveal(title), delay: 0.1 },
    kicker && { rec: prepareReveal(kicker), delay: 0.35 },
    subline && { rec: prepareReveal(subline), delay: 0.35 },
    scroll && { rec: prepareReveal(scroll), delay: 0.6 },
  ].filter(Boolean);

  // Parallax nhẹ khi hero cuộn ra khỏi khung.
  if (!prefersReducedMotion() && title) {
    gsap.to(title, {
      yPercent: -8,
      ease: EASE.none,
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }

  let played = false;

  return function playHero() {
    if (played) return;
    played = true;

    records.forEach(({ rec, delay }) => rec.play(delay));

    if (prefersReducedMotion() || !scroll) return;

    // Nhấp nháy nhẹ 1 → 0.4, chu kỳ 2.4s (yoyo 1.2s mỗi chiều).
    gsap.to(scroll, {
      opacity: 0.4,
      duration: 1.2,
      delay: 1.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    ScrollTrigger.refresh();
  };
}
