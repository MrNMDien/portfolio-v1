/* =========================================================================
   reveal.js — xương sống toàn trang: [data-reveal="words|lines|fade-up"]

   API:
     prepareReveal(el, { type })  → record { el, type, play(delay, dur), destroy() }
                                    (đặt sẵn trạng thái ẩn ngay khi gọi)
     initReveals()                → tự nối ScrollTrigger cho mọi [data-reveal]
                                    KHÔNG thuộc quyền quản lý của module khác
     refreshLineSplits()          → chia lại dòng (gọi sau khi font load / resize)

   Các module khác (hero, counters, horizontal, method, quote) tự sở hữu phần
   markup của mình nên được loại khỏi initReveals — xem OWNED_BY_OTHERS.
   ========================================================================= */

import { gsap, ScrollTrigger, prefersReducedMotion, DUR, EASE, debounce } from './env.js';
import { splitWords, splitLines, restore } from './split.js';

/* Quãng trượt của mask. > 100% vì vùng clip được nới thêm 0.24em cho dấu
   tiếng Việt (xem motion.css) — 110% sẽ để lộ một vệt chữ ở mép dưới. */
const REVEAL_TRAVEL = 150;

/* Thang stagger của transitions-polish: 0.04s mặc định, 0.08s cho item lớn.
   Tổng stagger (offset × số item) luôn giữ dưới ~0.3s. */
const STAGGER = {
  words: 0.04,
  lines: 0.08,
  grid: 0.08,
};

/* Phần tử do module khác điều phối → initReveals bỏ qua. */
const OWNED_BY_OTHERS = '.stat, .panel, .step, .quote__text';

const lineRecords = [];

const NOOP_RECORD = { el: null, type: 'none', inners: null, played: false, play: () => null, destroy: () => {} };

export function prepareReveal(el, { type: forcedType } = {}) {
  if (!el) return { ...NOOP_RECORD };

  const type = forcedType || el.dataset.reveal || 'fade-up';
  const rec = { el, type, inners: null, played: false };

  if (prefersReducedMotion()) {
    // reduced-motion: không split, chỉ fade nhanh 150ms.
    gsap.set(el, { autoAlpha: 0 });
    rec.play = (delay = 0) => {
      rec.played = true;
      return gsap.to(el, { autoAlpha: 1, duration: DUR.quick, ease: EASE.none, delay });
    };
    rec.destroy = () => gsap.set(el, { clearProps: 'opacity,visibility' });
    return rec;
  }

  if (type === 'words') {
    rec.inners = splitWords(el);
    gsap.set(rec.inners, { yPercent: REVEAL_TRAVEL });
    rec.play = (delay = 0, duration = DUR.reveal) => {
      rec.played = true;
      return gsap.to(rec.inners, {
        yPercent: 0,
        duration,
        ease: EASE.out,
        stagger: STAGGER.words,
        delay,
      });
    };
  } else if (type === 'lines') {
    rec.inners = splitLines(el);
    gsap.set(rec.inners, { yPercent: REVEAL_TRAVEL });
    rec.play = (delay = 0, duration = DUR.reveal) => {
      rec.played = true;
      return gsap.to(rec.inners, {
        yPercent: 0,
        duration,
        ease: EASE.out,
        stagger: STAGGER.lines,
        delay,
      });
    };
    lineRecords.push(rec);
  } else {
    gsap.set(el, { autoAlpha: 0, y: 28 });
    rec.play = (delay = 0, duration = DUR.fadeUp) => {
      rec.played = true;
      return gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: EASE.soft,
        delay,
        // trả transform về CSS để magnetic (cursor.js) không bị cộng dồn
        clearProps: 'transform,visibility',
      });
    };
  }

  rec.destroy = () => {
    gsap.killTweensOf(rec.inners || el);
    restore(el);
    rec.inners = null;
    gsap.set(el, { clearProps: 'all' });
    const i = lineRecords.indexOf(rec);
    if (i > -1) lineRecords.splice(i, 1);
  };

  return rec;
}

/** Một mask chỉ được cao đúng một dòng — cao hơn nghĩa là dòng đã chia sai. */
function isSplitStale() {
  return lineRecords.some((rec) => {
    const lineHeight = parseFloat(getComputedStyle(rec.el).lineHeight) || 0;
    if (!lineHeight) return false;
    return Array.from(rec.el.querySelectorAll(':scope > .rv-line:not(.rv-line--free)')).some(
      (mask) => mask.getBoundingClientRect().height > lineHeight * 1.6,
    );
  });
}

/** Chia lại dòng cho các record kiểu `lines` (font vừa load xong / đổi khổ). */
export function refreshLineSplits() {
  if (prefersReducedMotion()) return;

  lineRecords.forEach((rec) => {
    restore(rec.el);
    rec.inners = splitLines(rec.el);
    gsap.set(rec.inners, { yPercent: rec.played ? 0 : REVEAL_TRAVEL });
  });
}

/* Lưới an toàn: chia dòng luôn đo bằng font ĐANG hiển thị. Khi font web về
   muộn (hoặc bất kỳ thay đổi layout nào), chiều cao phần tử đổi → kiểm tra
   lại, nếu mask cao hơn một dòng thì chia lại. Chia đúng rồi thì không còn
   "stale" nên không có vòng lặp vô hạn. */
let watching = false;
export function watchLineSplits() {
  if (watching || prefersReducedMotion() || typeof ResizeObserver === 'undefined') return;
  watching = true;

  let queued = false;
  const observer = new ResizeObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (!isSplitStale()) return;
      refreshLineSplits();
      ScrollTrigger.refresh();
    });
  });

  lineRecords.forEach((rec) => observer.observe(rec.el));
}

export function initReveals() {
  const nodes = Array.from(document.querySelectorAll('[data-reveal]')).filter(
    (el) => !el.closest('.hero') && !el.matches(OWNED_BY_OTHERS),
  );

  // Gom anh em cùng cha để stagger theo lưới (0.08s), thay vì mỗi thẻ một trigger.
  const groups = new Map();
  nodes.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach((els, parent) => {
    const records = els.map((el) => prepareReveal(el));

    if (records.length === 1) {
      const rec = records[0];
      ScrollTrigger.create({
        trigger: rec.el,
        start: 'top 80%',
        once: true,
        onEnter: () => rec.play(),
      });
      return;
    }

    ScrollTrigger.create({
      trigger: parent,
      start: 'top 80%',
      once: true,
      onEnter: () => records.forEach((rec, i) => rec.play(i * STAGGER.grid)),
    });
  });

  // Đổi bề rộng → dòng gãy khác đi, phải chia lại.
  let lastWidth = window.innerWidth;
  window.addEventListener(
    'resize',
    debounce(() => {
      if (Math.abs(window.innerWidth - lastWidth) < 2) return;
      lastWidth = window.innerWidth;
      refreshLineSplits();
      ScrollTrigger.refresh();
    }, 220),
  );
}
