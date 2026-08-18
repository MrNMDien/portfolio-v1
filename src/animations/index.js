/* =========================================================================
   animations/index.js — entry Phase 2

   Thứ tự init (MOTION.md §Kiến trúc):
     lenis → preloader → (sau preloader) reveals, cursor, marquee, horizontal,
     counters, parallax.
   Thực tế: mọi module được *chuẩn bị* trước (đặt trạng thái ẩn, tạo
   ScrollTrigger) trong lúc preloader còn phủ màn, rồi preloader mới bắn hero
   và mở khoá scroll — nhờ vậy không có nháy nội dung và ScrollTrigger đã sẵn
   sàng ngay khi màn kéo lên.
   ========================================================================= */

import { ScrollTrigger, root, prefersReducedMotion } from './env.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initPreloader } from './preloader.js';
import { initReveals, refreshLineSplits, watchLineSplits } from './reveal.js';
import { initHero } from './hero.js';
import { initHeader } from './header.js';
import { initCounters } from './counters.js';
import { initHorizontal } from './horizontal.js';
import { initParallax } from './parallax.js';
import { initMarquee } from './marquee.js';
import { initMethod } from './method.js';
import { initQuote } from './quote.js';
import { initCursor } from './cursor.js';
import { initProgress } from './progress.js';

export function initAnimations() {
  const reduced = prefersReducedMotion();

  // `motion` bật các hook CSS của Phase 2 (tắt scroll ngang native ở Strengths,
  // mask parallax, nền quote…). Không bật khi người dùng xin giảm chuyển động.
  if (!reduced) root.classList.add('motion');

  const lenis = initSmoothScroll();

  initHeader();
  initProgress();
  initCursor();

  initReveals();
  const playHero = initHero();
  initCounters();
  initMethod();
  initQuote();
  initHorizontal();
  initParallax();
  initMarquee(lenis);

  // Chia dòng chỉ đúng khi đo bằng ĐÚNG font hiển thị. `document.fonts.ready`
  // có thể resolve sớm (stylesheet Google Fonts còn đang tải nên chưa có
  // @font-face nào "pending"), vì vậy phải yêu cầu load đích danh 3 họ chữ,
  // rồi để watchLineSplits() canh tiếp mọi thay đổi layout muộn.
  watchLineSplits();

  const settle = () => {
    refreshLineSplits();
    ScrollTrigger.refresh();
  };

  const fontFaces = [
    '400 1rem "Be Vietnam Pro"',
    '500 1rem "IBM Plex Mono"',
    '800 1rem "Archivo"',
    '900 1rem "Archivo"',
  ];

  if (document.fonts?.load) {
    Promise.all(fontFaces.map((face) => document.fonts.load(face).catch(() => {})))
      .then(() => document.fonts.ready)
      .then(settle)
      .catch(settle);
  }

  if (document.readyState === 'complete') requestAnimationFrame(settle);
  else window.addEventListener('load', () => requestAnimationFrame(settle), { once: true });

  initPreloader({
    onOpen: () => playHero(),
    onDone: () => {
      lenis?.start();
      ScrollTrigger.refresh();
    },
  });
}
