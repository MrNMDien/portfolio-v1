/* =========================================================================
   main.js
   - Đồng hồ realtime GMT+7 ở header (Phase 1)
   - Toàn bộ hệ thống chuyển động Phase 2 nằm ở ./animations/ (xem index.js)
   Script này là `type="module"` đặt trong <head> nên chạy sau khi HTML parse
   xong — document.body luôn tồn tại, không cần đợi DOMContentLoaded.
   ========================================================================= */

import { initAnimations } from './animations/index.js';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

function initClock() {
  const nodes = document.querySelectorAll('[data-clock]');
  if (!nodes.length) return;

  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  const tick = () => {
    const value = formatter.format(new Date());
    nodes.forEach((node) => {
      if (node.textContent !== value) node.textContent = value;
      if (node.tagName === 'TIME') node.dateTime = new Date().toISOString();
    });
  };

  tick();
  // Đồng bộ vào đầu giây rồi mới chạy interval 1s cho khỏi lệch.
  window.setTimeout(() => {
    tick();
    window.setInterval(tick, 1000);
  }, 1000 - (Date.now() % 1000));
}

initClock();
initAnimations();
