<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Full-stack (FE + BE) — đọc một workspace

- **FE (repo này):** Next.js app trong thư mục gốc workspace.
- **BE:** Cùng cấp `Tintuc`, thư mục [`BE_Admin`](../../BE_Admin) (Spring/Java hoặc stack bạn đang dùng).
- **Hợp đồng API:** `docs/API_SPEC.md` — khi đổi endpoint hoặc DTO, cập nhật file này (và BE) cho khớp.
- **Cách mở cả FE + BE trong Cursor:** `File` → `Open Workspace from File…` → chọn `Tintuc.fullstack.code-workspace` (nằm trong repo FE). Hai folder sẽ xuất hiện trong sidebar; agent có thể tìm/grep cả hai.
- **Env FE:** `NEXT_PUBLIC_API_URL` trỏ tới base API BE (vd. `http://localhost:8080/api/v1`), khớp với context-path BE.

Nếu bạn đổi tên/đường dẫn repo BE, sửa `path` của folder thứ hai trong `Tintuc.fullstack.code-workspace` cho đúng.
