# MOTION — Spec biên đạo chuyển động (Phase 2)

Nguyên tắc chung: chuyển động phải **kể chuyện tốc độ và kỷ luật** — nhanh, dứt khoát, không lề mề.
Mọi duration/easing align theo skill `transitions-dev` + `transitions-polish` (agent thực thi phải load 2 skill này trước khi viết code). Toàn bộ tôn trọng `prefers-reduced-motion: reduce` (tắt smooth scroll, thay reveal bằng fade nhanh 150ms, tắt marquee/parallax/cursor).

## Kiến trúc

- `src/animations/index.js` — entry, init theo thứ tự: lenis → preloader → (sau preloader xong) reveals, cursor, marquee, horizontal, counters, parallax, clock
- Mỗi module 1 file, export `init*()`. ScrollTrigger dùng chung `scrollerProxy` với Lenis (pattern chuẩn: lenis.on('scroll', ScrollTrigger.update) + gsap.ticker)
- Failsafe: nếu font/asset load quá 2.5s, preloader tự kết thúc

## 1. Preloader (mở màn — ấn tượng đầu tiên)

1. Nền cream phủ toàn màn, monogram "MĐ" + counter `000 → 100` (mono font, đếm theo tiến độ load thật, tối thiểu 1.2s, tối đa 2.5s)
2. Counter chạm 100 → monogram scale nhẹ 1.04 rồi toàn khối preloader trượt lên bằng 2 shutter panel (stagger 80ms), ease `power4.inOut`, 0.9s
3. Ngay khi shutter mở: hero headline reveal (không chờ) — cảm giác "bức màn kéo lên là sân khấu đã diễn"

## 2. Text reveal (xương sống toàn trang)

- `data-reveal="words"`: split theo **word** (KHÔNG split theo ký tự — tiếng Việt có dấu sẽ vỡ), mỗi word bọc trong mask overflow hidden, translateY 110% → 0, ease `power3.out`, duration 0.7s, stagger 0.04s, trigger khi vào 80% viewport, chỉ chạy 1 lần
- `data-reveal="lines"`: tương tự theo dòng, stagger 0.09s — dùng cho manifesto Method
- `data-reveal="fade-up"`: y 28px → 0 + opacity, 0.6s `power2.out` — cho body text, card
- Grid card (Works, Strengths mobile): stagger 0.08s theo index

## 3. Hero

- Headline: word reveal như trên, delay 0.1s sau shutter
- Kicker + subline: fade-up sau headline 0.25s
- Scroll hint: fade in cuối cùng + loop nhấp nháy nhẹ opacity 1→0.4 (2.4s, sine)
- Parallax nhẹ trên headline khi scroll ra (yPercent -8)

## 4. Header

- Đồng hồ realtime GMT+7 (đã có Phase 1)
- Header thu gọn khi scroll xuống >120px (thêm class `.is-scrolled`: nền cream 92% + blur nhẹ + border-bottom line), hiện lại đầy đủ khi scroll lên (dùng ScrollTrigger direction)
- Nav link: hover underline slide-in từ trái, 250ms `cubic-bezier(0.4, 0, 0.2, 1)`

## 5. Impact / Numbers — section đinh

- Số: counter animation bằng gsap `snap`, 1.4s `power2.out`, format kiểu VN (`15+`, `180+`, `04+`, `05`) — bắt đầu khi section vào 70% viewport, 1 lần
- Đơn vị/chú thích cam: fade-up sau số 0.2s
- Line ngăn cách: scaleX 0→1 từ trái, 0.8s, cùng lúc counter chạy

## 6. Strengths — horizontal pin-scroll (desktop ≥1024px)

- Pin `.pin-strengths`, translateX cả track theo scroll, scrub 1, snap theo panel (`snap: 1/(n-1)`, duration 0.4, ease `power1.inOut`)
- Mỗi panel khi active: headline reveal + chỉ số accent đếm nhanh
- Progress bar mảnh dưới section chạy theo tiến độ ngang
- Mobile/tablet: KHÔNG pin — stack dọc, mỗi panel fade-up bình thường

## 7. Selected Works

- Card: fade-up stagger; media bên trong `data-parallax="0.15"` (yPercent ±8 scrub)
- Hover (desktop): media scale 1.04 (0.6s `power2.out`), title chuyển accent cam, con số kết quả nhích lên 4px — mượt, không bật tanh tách

## 8. Method + Marquee

- Manifesto: line reveal
- 4 bước: stagger 0.1s, số thứ tự đếm 01→04
- Marquee `RESEARCH — TEST — SCALE — OPTIMIZE`: xVelocity liên tục ~60px/s, **đổi hướng theo hướng scroll** (lấy velocity từ Lenis, lerp cho mượt), pause khi tab ẩn

## 9. Quote (nền ink đảo màu)

- Nền ink trượt phủ bằng clip-path inset khi section vào (0.8s `power3.inOut`)
- Chữ quote: line reveal chậm hơn bình thường (0.9s) — nhịp lắng lại trước Contact

## 10. Contact

- Headline "Let's talk numbers.": word reveal
- Email link: chữ cỡ lớn, hover: underline dày accent + con trỏ magnetic hút mạnh hơn bình thường

## 11. Custom cursor + magnetic (desktop only, pointer: fine)

- Dot 8px ink + vòng 36px viền line theo sau (lerp 0.12)
- Hover `data-magnetic`: element hút về con trỏ (translate tối đa 6px, spring về 0 khi rời — gsap `elastic.out(1, 0.4)` 0.6s); vòng cursor scale 1.6 + đổi viền accent
- Hover link/card: vòng scale 2.2 opacity 0.6. Ẩn hoàn toàn trên touch device

## 12. Toàn cục

- Scroll progress bar 2px accent cam fixed top, scaleX theo tiến độ trang
- Lenis: `lerp: 0.1`, `wheelMultiplier: 1` — mượt nhưng không trôi
- Anchor nav click: lenis.scrollTo với offset header, 1.1s `power3.inOut`
- Không animation nào chạy lại khi scroll ngược (trừ parallax/marquee/scrub)

## QA checklist Phase 2

1. 60fps khi scroll toàn trang (kiểm tra không layout thrash — chỉ transform/opacity)
2. `prefers-reduced-motion` hoạt động thật
3. Refresh giữa trang (scroll restore) không vỡ pin/trigger — gọi `ScrollTrigger.refresh()` sau font load
4. Resize desktop↔mobile không vỡ horizontal pin (matchMedia của ScrollTrigger)
5. `npm run build` pass, console sạch
