/* =========================================================================
   marquee.js — MOTION.md §8
   Tốc độ nền ~60px/s, đảo hướng theo hướng scroll (velocity Lenis, lerp cho
   mượt), dừng khi tab ẩn hoặc section ra khỏi khung.

   Lưu ý đo đạc: track Phase 1 rộng 2520px = 2 bộ nội dung, NHƯNG chu kỳ lặp
   thật là 1285px (2520 thiếu một `gap` cuối). Vì vậy `xPercent: -50` sẽ nhảy
   ~25px mỗi vòng. Ở đây lấy chu kỳ = khoảng cách giữa hai item cùng chữ, rồi
   nhân bản nội dung cho đủ phủ khung nhìn → lặp liền mạch ở mọi bề rộng.
   ========================================================================= */

import { gsap, ScrollTrigger, prefersReducedMotion, EASE } from './env.js';

const SPEED = 60; // px/s
const MAX_BOOST = 4;
const SET_ITEMS = 4; // Research — Test — Scale — Optimize

export function initMarquee(lenis) {
  const track = document.querySelector('[data-marquee-track]');
  const wrap = document.querySelector('[data-marquee]');
  if (!track || prefersReducedMotion()) return;

  const items = () => track.querySelectorAll('.marquee__item');
  const first = items();
  if (first.length <= SET_ITEMS) return;

  // Chu kỳ lặp = khoảng cách từ item đầu tới lần xuất hiện tiếp theo của nó.
  const period = first[SET_ITEMS].offsetLeft - first[0].offsetLeft;
  if (!period) return;

  const seed = Array.from(track.children);
  const ensureWidth = () => {
    let guard = 0;
    while (track.scrollWidth - period < window.innerWidth + 240 && guard < 8) {
      seed.forEach((node) => track.appendChild(node.cloneNode(true)));
      guard += 1;
    }
  };
  ensureWidth();
  window.addEventListener('resize', ensureWidth);

  const loop = gsap.to(track, {
    x: -period,
    duration: period / SPEED,
    ease: EASE.none,
    repeat: -1,
  });

  let direction = 1;
  let boost = 1;
  let current = 1;

  const onVelocity = (velocity) => {
    if (velocity > 0.05) direction = 1;
    else if (velocity < -0.05) direction = -1;
    boost = 1 + Math.min(Math.abs(velocity) / 10, MAX_BOOST);
  };

  if (lenis) {
    lenis.on('scroll', ({ velocity }) => onVelocity(velocity));
  } else {
    let last = window.scrollY;
    window.addEventListener(
      'scroll',
      () => {
        const now = window.scrollY;
        onVelocity(now - last);
        last = now;
      },
      { passive: true },
    );
  }

  gsap.ticker.add(() => {
    boost += (1 - boost) * 0.05;
    current += (direction * boost - current) * 0.1;
    loop.timeScale(current);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) loop.pause();
    else loop.resume();
  });

  if (wrap) {
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.resume() : loop.pause()),
    });
    if (!st.isActive) loop.pause();
  }
}
