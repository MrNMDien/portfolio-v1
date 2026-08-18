/* =========================================================================
   preloader.js — mở màn (MOTION.md §1)

   000 → 100 chạy theo tiến độ load thật (fonts.ready + window.load), tối thiểu
   1.2s, tối đa 2.5s. Chạm 100 → monogram scale 1.04 → khối preloader (ink) và
   tấm `.shutter` (accent) lần lượt trượt lên, lệch nhau 80ms, 0.9s power4.inOut
   — đúng "2 shutter panel" của spec. Hero reveal bắn ngay khi màn bắt đầu mở.

   Class `is-loading` được gắn bởi script inline trong index.html (không đợi
   DOMContentLoaded) và có failsafe riêng ở đó phòng khi bundle không chạy.
   ========================================================================= */

import { gsap, root, DUR, EASE } from './env.js';

const LOAD_MAX = 2.5; // trần thời gian đếm
const LOAD_MIN = 1.2; // sàn thời gian đếm

const pad3 = (n) => String(Math.max(0, Math.min(100, Math.round(n)))).padStart(3, '0');

export function initPreloader({ onOpen, onDone } = {}) {
  const el = document.querySelector('[data-preloader]');
  const finish = () => {
    onOpen?.();
    onDone?.();
  };

  // reduced-motion (inline script không gắn is-loading) hoặc markup thiếu → bỏ qua.
  if (!el || !root.classList.contains('is-loading')) {
    root.classList.remove('is-loading');
    finish();
    return;
  }

  const count = el.querySelector('[data-preloader-count]');
  const bar = el.querySelector('[data-preloader-bar]');
  const mark = el.querySelector('.preloader__mark');
  const shutter = document.querySelector('[data-shutter]');

  const state = { v: 0 };
  const startedAt = performance.now();
  let exited = false;

  const render = () => {
    if (count) count.textContent = `${pad3(state.v * 100)} — 100`;
    if (bar) gsap.set(bar, { scaleX: state.v });
  };

  const exit = () => {
    if (exited) return;
    exited = true;

    el.style.pointerEvents = 'none';
    state.v = 1;
    render();

    const tl = gsap.timeline();

    tl.to(mark, { scale: 1.04, duration: 0.3, ease: EASE.soft })
      .set(shutter, { yPercent: 0 }, '>-0.05')
      .to(el, { yPercent: -100, duration: DUR.shutter, ease: EASE.shutter }, '<')
      .to(shutter, { yPercent: -100, duration: DUR.shutter, ease: EASE.shutter }, '<0.08')
      // "bức màn kéo lên là sân khấu đã diễn" — hero không chờ màn đóng xong.
      .add(() => onOpen?.(), '<0.15')
      .add(() => {
        root.classList.remove('is-loading');
        gsap.set(shutter, { clearProps: 'transform' });
        gsap.set(el, { clearProps: 'transform' });
        onDone?.();
      });
  };

  render();

  const load = gsap.to(state, {
    v: 1,
    duration: LOAD_MAX,
    ease: EASE.none,
    onUpdate: render,
    onComplete: exit,
  });

  // Khi asset thật sự xong → tăng tốc phần còn lại, nhưng vẫn giữ sàn 1.2s.
  const speedUp = () => {
    if (exited || load.progress() >= 1) return;
    const elapsed = (performance.now() - startedAt) / 1000;
    const finishAt = Math.max(LOAD_MIN, elapsed + 0.3);
    const remainingReal = Math.max(0.12, finishAt - elapsed);
    const remainingTween = (1 - state.v) * LOAD_MAX;
    load.timeScale(remainingTween / remainingReal);
  };

  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const windowLoad =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

  Promise.all([fonts, windowLoad]).then(speedUp).catch(speedUp);
}
