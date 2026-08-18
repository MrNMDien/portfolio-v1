/* =========================================================================
   env.js — nền tảng dùng chung cho mọi module animation
   Đăng ký plugin GSAP một lần, gom các truy vấn môi trường (reduced-motion,
   pointer, breakpoint) và các token duration/easing của dự án.
   ========================================================================= */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

export { gsap, ScrollTrigger };

export const root = document.documentElement;

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

/** Người dùng yêu cầu giảm chuyển động → mọi module tự guard bằng hàm này. */
export const prefersReducedMotion = () => reduceQuery.matches;

/** Chuột thật (không phải touch) → cursor tuỳ biến + magnetic mới bật. */
export const finePointer = () => pointerQuery.matches;

export const DESKTOP = '(min-width: 1024px)';
export const BELOW_DESKTOP = '(max-width: 1023px)';

/* Token motion của dự án. Giá trị nào MOTION.md nói rõ thì dùng đúng số đó;
   phần còn lại bám thang của transitions-dev (250ms / 400ms / 500ms,
   ease-smooth-out = cubic-bezier(.22,1,.36,1) ≈ power3.out của GSAP). */
export const DUR = {
  quick: 0.15,
  fast: 0.25,
  medium: 0.35,
  slow: 0.4,
  reveal: 0.7,
  fadeUp: 0.6,
  counter: 1.4,
  shutter: 0.9,
};

export const EASE = {
  out: 'power3.out',
  soft: 'power2.out',
  inOut: 'power3.inOut',
  shutter: 'power4.inOut',
  none: 'none',
};

/** debounce nhỏ gọn cho resize handler. */
export function debounce(fn, wait = 200) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), wait);
  };
}
