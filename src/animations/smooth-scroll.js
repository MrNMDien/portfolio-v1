/* =========================================================================
   smooth-scroll.js — Lenis + cầu nối ScrollTrigger + anchor nav
   lerp 0.1 / wheelMultiplier 1 (MOTION.md §12): mượt nhưng không trôi.
   prefers-reduced-motion → không khởi tạo, trả null, trang dùng scroll native.
   ========================================================================= */

import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion, EASE } from './env.js';

let lenis = null;

function bindAnchors(instance) {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

    const link = event.target.closest?.('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash.length < 2) return;

    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();

    if (!instance) {
      target.scrollIntoView();
      return;
    }

    // Không cộng offset thủ công: Lenis đã tôn trọng `scroll-margin-top`
    // của `[id]` trong sections.css (= --header-h + 24px). Cộng thêm sẽ
    // trừ hai lần và dừng thấp hơn tiêu đề gần 100px.
    instance.scrollTo(target, {
      duration: 1.1,
      easing: gsap.parseEase(EASE.inOut),
    });
  });
}

export function initSmoothScroll() {
  if (prefersReducedMotion()) {
    bindAnchors(null);
    return null;
  }

  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
    autoRaf: false,
  });

  // Pattern chuẩn: Lenis đẩy scroll → ScrollTrigger.update, rAF do gsap.ticker lo.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Khoá scroll trong lúc preloader chạy; index.js gọi start() khi màn kéo xong.
  lenis.stop();

  bindAnchors(lenis);
  return lenis;
}

export function getLenis() {
  return lenis;
}
