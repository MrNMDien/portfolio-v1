/* =========================================================================
   method.js — MOTION.md §8 (phần 4 bước)
   Stagger 0.08s theo bước (thang stagger của transitions-polish cho item lớn;
   MOTION.md ghi 0.1s nhưng chính nó nói timing align theo skill), số thứ tự
   đếm 01 → 04.
   Manifesto (`data-reveal="lines"`) do reveal.js lo.
   ========================================================================= */

import { ScrollTrigger } from './env.js';
import { prepareReveal } from './reveal.js';
import { countUp } from './counters.js';

const STEP_STAGGER = 0.08;

export function initMethod() {
  const list = document.querySelector('.method__steps');
  if (!list) return;

  const steps = Array.from(list.querySelectorAll('.step'));
  if (!steps.length) return;

  const records = steps.map((step) => prepareReveal(step, { type: 'fade-up' }));

  ScrollTrigger.create({
    trigger: list,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      // 0.08s/bước (thang stagger cho item lớn) → 4 bước gói trong 0.24s.
      records.forEach((rec, i) => rec.play(i * STEP_STAGGER));
      steps.forEach((step, i) => {
        countUp(step.querySelector('.step__index'), i + 1, {
          pad: 2,
          duration: 0.6,
          delay: i * STEP_STAGGER + 0.15,
        });
      });
    },
  });
}
