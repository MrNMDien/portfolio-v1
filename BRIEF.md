# BRIEF — Thiết kế & kỹ thuật (nguồn chân lý cho mọi phase)

Portfolio Nguyễn Minh Điền — Performance Marketing Leader. Nội dung lấy từ `CONTENT.md` (không tự bịa nội dung khác). Phong cách: DAS-inspired editorial — nền cream, typography đen cực lớn, accent cam, nhiều khoảng trắng, cảm giác "tạp chí thiết kế" chứ không phải "template marketing".

## Stack

- Vite (vanilla JS, không framework) + GSAP + ScrollTrigger + Lenis
- `npm i gsap lenis` — import ESM trong `src/main.js`
- Không TypeScript, không Tailwind — CSS thuần có design tokens

## Cấu trúc file

```
index.html
src/main.js
src/styles/tokens.css      # biến màu, type scale, spacing
src/styles/base.css        # reset, layout primitives, utilities
src/styles/sections.css    # style từng section (có thể tách nhỏ nếu >800 dòng)
src/animations/*.js        # (Phase 2) preloader, reveal, cursor, horizontal, counters, marquee
public/                    # favicon, ảnh placeholder
```

## Design tokens

```css
--bg: #F3EEE6;          /* cream */
--bg-deep: #EAE3D6;     /* cream đậm cho section xen kẽ */
--ink: #141311;         /* chữ chính */
--ink-soft: #6E675C;    /* chữ phụ */
--accent: #FF4D00;      /* cam — dùng tiết chế: label, số, hover, ~5% diện tích */
--line: rgba(20,19,17,.14);
--radius: 2px;          /* gần như vuông — chất editorial */
```

Section Quote hoặc Contact có thể đảo nền (`--ink` làm nền, cream làm chữ) để tạo nhịp.

## Typography (bắt buộc hỗ trợ tiếng Việt có dấu)

- Display (headline EN cực lớn): **Archivo** (Google Fonts, weight 500–900, subset `latin,vietnamese`) — dùng width/weight lớn, letter-spacing âm nhẹ (-0.03em), uppercase cho headline chính
- Body (VN): **Be Vietnam Pro** 400/500 — line-height 1.6
- Mono (label, số, meta): **IBM Plex Mono** 400/500 — subset vietnamese
- Hero headline: `clamp(3rem, 11vw, 10rem)`; section headline: `clamp(2rem, 6vw, 4.5rem)`
- Số ở section Impact: display font, `clamp(3rem, 8vw, 7rem)`, accent cam cho đơn vị

## Layout principles

- Grid 12 cột, max-width 1440px, padding trái/phải `clamp(20px, 4vw, 64px)`
- Label section kiểu `001 / PROFILE` — mono, nhỏ, kèm đường line ngang
- Khoảng cách giữa section: `clamp(120px, 18vh, 240px)` — whitespace là đặc điểm nhận diện
- Media card: tỉ lệ 4:3 hoặc 3:4, placeholder là gradient cream-cam trừu tượng + noise nhẹ (CSS/SVG, KHÔNG dùng ảnh stock)
- Responsive: mobile 375px / tablet 768px / desktop 1280px+. Mobile: hero headline vẫn phải "choáng" (chiếm ≥60vh), horizontal-scroll section chuyển thành stack dọc

## Quy ước animation-ready (Phase 1 phải gắn sẵn, Phase 2 mới viết JS)

- `data-reveal="words"` / `data-reveal="lines"` / `data-reveal="fade-up"` trên text sẽ animate
- `data-parallax="0.15"` trên media card
- `data-counter="15" data-counter-suffix="+"` trên số Impact
- `data-magnetic` trên link/button/nav
- `.pin-strengths` bọc section horizontal scroll, `.panel` cho từng panel
- Preloader markup đặt sẵn đầu `<body>` (class `.preloader`), transition shutter overlay `.shutter`
- KHÔNG viết animation JS ở Phase 1 — chỉ markup + CSS tĩnh hoàn chỉnh, trang phải đẹp và đọc được khi chưa có JS

## Quality bar (bắt buộc trước khi báo xong)

1. Chạy `Skill` tool với `ui-ux-pro-max` để lấy guideline style/palette/font phù hợp trước khi viết CSS; tham chiếu skill `impeccable`, `design-taste-frontend` cho taste
2. Không "AI slop": không glassmorphism tím, không gradient tím-xanh, không emoji trong UI, không card bo tròn 16px mặc định
3. Tiếng Việt render đúng dấu ở mọi font (kiểm tra chữ "ầ ễ ộ ứ đ")
4. `npm run build` pass, không lỗi console khi mở trang
5. Semantic HTML (header/main/section/footer), alt text, focus-visible, contrast đạt AA trên nền cream
```
