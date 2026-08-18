/* =========================================================================
   split.js — tách text thành WORD hoặc LINE để làm mask reveal.

   Quy tắc bắt buộc (tiếng Việt):
   - KHÔNG bao giờ tách theo ký tự — "NGUYỄN", "Chạy", "nghề" sẽ vỡ dấu.
   - Mask dùng `overflow: clip` + `overflow-clip-margin` (xem motion.css) nên
     dấu phụ phía trên (Ễ, Ầ) và phần đuôi chữ (g, y) KHÔNG bị cắt ở trạng
     thái nghỉ. Đổi lại quãng trượt phải lớn hơn 100% một chút (150%) thì chữ
     mới thực sự khuất khỏi vùng clip — xem REVEAL_TRAVEL trong reveal.js.
   - innerHTML gốc được cache để restore/re-split (đổi khổ màn hình, font load
     xong) mà không mất markup con (.accent-dot, .quote__mark…).
   ========================================================================= */

const CACHE = new WeakMap();

function cache(el) {
  if (!CACHE.has(el)) CACHE.set(el, el.innerHTML);
}

/** Trả markup gốc. No-op nếu phần tử chưa từng bị split. */
export function restore(el) {
  const html = CACHE.get(el);
  if (html != null) el.innerHTML = html;
}

function isBlockish(el) {
  const display = getComputedStyle(el).display;
  return !(
    display === 'inline' ||
    display === 'inline-block' ||
    display === 'inline-flex' ||
    display === 'contents'
  );
}

/* ---- WORDS ---------------------------------------------------------------
   Đệ quy qua cây con để giữ nguyên thẻ inline (ví dụ <span class="accent-dot">)
   — chỉ text node mới bị bọc mask.                                          */
function buildWords(node, out) {
  const frag = document.createDocumentFragment();

  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const mask = document.createElement('span');
        mask.className = 'rv-word';
        const inner = document.createElement('span');
        inner.className = 'rv-word__in';
        inner.textContent = part;
        mask.appendChild(inner);
        frag.appendChild(mask);
        out.push(inner);
      });
      return;
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const clone = child.cloneNode(false);
      clone.appendChild(buildWords(child, out));
      frag.appendChild(clone);
    }
  });

  return frag;
}

export function splitWords(el) {
  cache(el);
  const inners = [];
  const frag = buildWords(el, inners);
  el.replaceChildren(frag);
  return inners;
}

/* ---- LINES ---------------------------------------------------------------
   B1: làm phẳng nội dung thành "atom" (từ = span, thẻ con = giữ nguyên cả cụm)
   B2: đo offsetTop để gom atom cùng dòng
   B3: bọc mỗi dòng vào <span.rv-line><span.rv-line__in>…                     */
function buildAtoms(node, out) {
  const frag = document.createDocumentFragment();

  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const atom = document.createElement('span');
        atom.className = 'rv-atom';
        atom.textContent = part;
        frag.appendChild(atom);
        out.push(atom);
      });
      return;
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      // Thẻ con giữ nguyên cả cụm — không bới vào trong, tránh phá cấu trúc
      // (ví dụ .quote__mark là block, font 11rem, line-height .6).
      const clone = child.cloneNode(true);
      if (isBlockish(child)) clone.dataset.rvBlock = '1';
      frag.appendChild(clone);
      out.push(clone);
    }
  });

  return frag;
}

export function splitLines(el) {
  cache(el);

  const atoms = [];
  el.replaceChildren(buildAtoms(el, atoms));
  if (!atoms.length) return [];

  // Gom theo offsetTop. Atom dạng block luôn đứng riêng một "dòng".
  const groups = [];
  let current = null;
  let top = null;

  atoms.forEach((atom) => {
    const isBlock = atom.dataset.rvBlock === '1';
    const offset = atom.offsetTop;

    if (isBlock || !current || Math.abs(offset - top) > 3) {
      current = { atoms: [], block: isBlock };
      groups.push(current);
      top = offset;
    }

    current.atoms.push(atom);

    if (isBlock) {
      current = null;
      top = null;
    }
  });

  const inners = [];

  groups.forEach((group) => {
    const mask = document.createElement('span');
    // Dòng chứa block atom (dấu ngoặc kép khổng lồ) không mask — glyph cao hơn
    // line-box quá nhiều, clip sẽ cắt mất. Dòng đó chỉ fade + trượt.
    mask.className = group.block ? 'rv-line rv-line--free' : 'rv-line';

    const inner = document.createElement('span');
    inner.className = 'rv-line__in';

    const first = group.atoms[0];
    const last = group.atoms[group.atoms.length - 1];

    first.parentNode.insertBefore(mask, first);
    mask.appendChild(inner);

    // Chuyển cả atom lẫn khoảng trắng nằm giữa chúng vào trong mask.
    let node = first;
    while (node) {
      const next = node.nextSibling;
      inner.appendChild(node);
      if (node === last) break;
      node = next;
    }

    inners.push(inner);
  });

  return inners;
}
