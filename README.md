# Portfolio — Nguyễn Minh Điền

Portfolio cá nhân phong cách editorial (cream / đen / cam) — Vite + GSAP + ScrollTrigger + Lenis.

## Chạy trên máy

```bash
npm install
npm run dev
```

Mở http://localhost:5173. Build production: `npm run build` (ra thư mục `dist/`), xem thử bản build: `npm run preview`.

## Cấu trúc

| File | Vai trò |
|---|---|
| `CONTENT.md` | Toàn bộ nội dung chữ — nguồn chân lý, sửa nội dung thì sửa ở đây trước |
| `BRIEF.md` | Design tokens, typography, quy tắc layout |
| `MOTION.md` | Spec toàn bộ animation |
| `index.html` | Markup 10 section |
| `src/styles/` | tokens.css (màu/chữ) · base.css · sections.css · motion.css |
| `src/animations/` | Mỗi hiệu ứng 1 module (preloader, reveal, cursor, horizontal, counters…) |

## Danh sách TODO — số liệu thật cần điền

Trong `index.html` tìm `<!-- TODO:` (14 chỗ) — mỗi chỗ nằm ngay cạnh phần liên quan.
Trên giao diện, chỗ chờ số hiển thị là **gạch chân cam** (class `.tbd`).

1. **Profile**: số năm kinh nghiệm chính xác · sĩ số team
2. **Impact**: xác nhận 180+ tỷ/năm tổng chi tiêu · số năm · sĩ số
3. **Strengths**: % ngân sách Meta · tốc độ test creative TikTok
4. **Case 1 (Meta)**: ngành/thương hiệu · hệ số scale · số tháng · ROAS
5. **Case 2 (TikTok)**: số mẫu creative/tháng · % doanh số · số tháng
6. **Case 3 (Dashboard)**: thời gian ra quyết định trước/sau
7. **Contact**: email cá nhân dùng ứng tuyển (đang tạm `oad@ngocdung.com`) · LinkedIn · Zalo/phone

## Deploy (khi sẵn sàng)

Chưa deploy theo yêu cầu. Khi muốn: đẩy lên GitHub → import vào Vercel (framework: Vite, build `npm run build`, output `dist`) → có link gắn CV/LinkedIn; gắn domain riêng trong phần Domains của Vercel.
