/* =========================================================================
   cursor.js — MOTION.md §11 — con trỏ tuỳ biến + magnetic
   Chỉ bật khi pointer: fine và không reduced-motion. Touch device: không tạo
   DOM, không nghe sự kiện.
   ========================================================================= */

import { gsap, root, prefersReducedMotion, finePointer, DUR, EASE } from './env.js';

const RING_LERP = 0.12;
const MAGNET_MAX = 6; // px
/* Chỉ những gì thật sự bấm được mới làm vòng cursor phình ra. `.panel` và
   `.step` từng nằm ở đây nhưng chúng không phải link/button — vòng nở ra trên
   chúng là tín hiệu tương tác giả. */
const HOVER_TARGETS = 'a, button, .case, [data-magnetic]';

export function initCursor() {
  if (prefersReducedMotion() || !finePointer()) return;

  const wrap = document.createElement('div');
  wrap.className = 'cursor';
  wrap.setAttribute('aria-hidden', 'true');

  const dot = document.createElement('span');
  dot.className = 'cursor__dot';
  const ring = document.createElement('span');
  ring.className = 'cursor__ring';

  wrap.append(dot, ring);
  document.body.appendChild(wrap);
  root.classList.add('has-cursor');

  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ringPos = { x: pointer.x, y: pointer.y };

  const setDotX = gsap.quickSetter(dot, 'x', 'px');
  const setDotY = gsap.quickSetter(dot, 'y', 'px');
  const setRingX = gsap.quickSetter(ring, 'x', 'px');
  const setRingY = gsap.quickSetter(ring, 'y', 'px');

  setDotX(pointer.x);
  setDotY(pointer.y);
  setRingX(pointer.x);
  setRingY(pointer.y);

  let visible = false;

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      setDotX(pointer.x);
      setDotY(pointer.y);
      if (!visible) {
        visible = true;
        gsap.to(wrap, { autoAlpha: 1, duration: DUR.quick });
      }
    },
    { passive: true },
  );

  document.addEventListener('pointerleave', () => {
    visible = false;
    gsap.to(wrap, { autoAlpha: 0, duration: DUR.quick });
  });

  gsap.ticker.add(() => {
    ringPos.x += (pointer.x - ringPos.x) * RING_LERP;
    ringPos.y += (pointer.y - ringPos.y) * RING_LERP;
    setRingX(ringPos.x);
    setRingY(ringPos.y);
  });

  /* ---- Trạng thái hover ------------------------------------------------ */
  document.addEventListener('pointerover', (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== 'function') return;

    wrap.classList.toggle('is-inverted', !!target.closest('.section--ink'));

    const hot = target.closest(HOVER_TARGETS);
    wrap.classList.toggle('is-hover', !!hot);
    wrap.classList.toggle('is-magnetic', !!(hot && hot.hasAttribute('data-magnetic')));
  });

  /* ---- Magnetic --------------------------------------------------------- */
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    // Email khổng lồ ở Contact hút mạnh hơn phần còn lại (MOTION.md §10).
    const strength = el.classList.contains('contact__mail') ? 2 : 1;
    const max = MAGNET_MAX * strength;

    const moveX = gsap.quickTo(el, 'x', { duration: DUR.medium, ease: EASE.out });
    const moveY = gsap.quickTo(el, 'y', { duration: DUR.medium, ease: EASE.out });

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
      moveX(gsap.utils.clamp(-max, max, dx * max));
      moveY(gsap.utils.clamp(-max, max, dy * max));
    };

    el.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      el.addEventListener('pointermove', onMove);
    });

    el.addEventListener('pointerleave', () => {
      el.removeEventListener('pointermove', onMove);
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
        overwrite: true,
      });
    });
  });
}
