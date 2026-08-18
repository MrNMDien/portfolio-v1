/* =========================================================================
   horizontal.js — MOTION.md §6 — Strengths pin-scroll

   Desktop ≥1024px: pin `.pin-strengths`, kéo `.panels-track` theo trục X,
   scrub 1, snap 1/(n-1). Mỗi panel khi vào khung: title word-reveal, body +
   metric fade-up, số thứ tự đếm nhanh. Progress bar mảnh chạy dưới section.
   Dưới 1024px: KHÔNG pin — track giữ scroll ngang native (>=768) hoặc stack
   dọc (<768), panel fade-up bình thường.

   Toàn bộ nằm trong gsap.matchMedia() nên resize desktop↔mobile tự dọn dẹp.
   ========================================================================= */

import { gsap, ScrollTrigger, prefersReducedMotion, DESKTOP, BELOW_DESKTOP, EASE } from './env.js';
import { prepareReveal } from './reveal.js';
import { countUp } from './counters.js';

export function initHorizontal() {
  const pin = document.querySelector('.pin-strengths');
  const track = document.querySelector('.panels-track');
  if (!pin || !track) return;

  const panels = Array.from(track.querySelectorAll('.panel'));
  if (!panels.length) return;

  const reduced = prefersReducedMotion();
  const mm = gsap.matchMedia();

  /* ---- Desktop: pin + translateX --------------------------------------- */
  mm.add(DESKTOP, () => {
    if (reduced) {
      gsap.set(panels, { clearProps: 'opacity,visibility,transform' });
      return undefined;
    }

    const progress = document.createElement('div');
    progress.className = 'strengths__progress';
    progress.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('span');
    progress.appendChild(bar);
    pin.appendChild(progress);

    gsap.set(panels, { autoAlpha: 1 });

    const parts = panels.map((panel) => ({
      panel,
      title: prepareReveal(panel.querySelector('.panel__title'), { type: 'words' }),
      body: prepareReveal(panel.querySelector('.panel__body'), { type: 'fade-up' }),
      metric: prepareReveal(panel.querySelector('.panel__metric'), { type: 'fade-up' }),
      index: panel.querySelector('.panel__index span'),
    }));

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const drive = gsap.to(track, {
      x: () => -distance(),
      ease: EASE.none,
    });

    const st = ScrollTrigger.create({
      animation: drive,
      trigger: pin,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: 1 / (panels.length - 1),
        duration: 0.4,
        ease: 'power1.inOut',
        delay: 0.05,
      },
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    });

    const panelTriggers = parts.map((part, i) =>
      ScrollTrigger.create({
        trigger: part.panel,
        containerAnimation: drive,
        start: 'left 78%',
        once: true,
        onEnter: () => {
          // Nhịp đều 0.08s giữa các lớp trong panel (thang stagger).
          part.title.play();
          part.body.play(0.08);
          part.metric.play(0.16);
          countUp(part.index, i + 1, { pad: 2, duration: 0.5, delay: 0.08 });
        },
      }),
    );

    return () => {
      panelTriggers.forEach((trigger) => trigger.kill());
      st.kill();
      drive.kill();
      parts.forEach((part, i) => {
        part.title.destroy();
        part.body.destroy();
        part.metric.destroy();
        if (part.index) part.index.textContent = String(i + 1).padStart(2, '0');
      });
      progress.remove();
      gsap.set(track, { clearProps: 'transform' });
      gsap.set(panels, { clearProps: 'opacity,visibility,transform' });
    };
  });

  /* ---- Dưới 1024px: stack / scroll ngang native, fade-up thường --------- */
  mm.add(BELOW_DESKTOP, () => {
    const records = panels.map((panel) => prepareReveal(panel, { type: 'fade-up' }));

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top 85%',
      once: true,
      onEnter: () => records.forEach((rec, i) => rec.play(i * 0.08)),
    });

    return () => {
      trigger.kill();
      records.forEach((rec) => rec.destroy());
      gsap.set(panels, { clearProps: 'opacity,visibility,transform' });
    };
  });
}
