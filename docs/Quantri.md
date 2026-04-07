# Front-End Project Rules & Guidelines (Next.js + MUI + Antd)

## 1. Tech Stack & Versions
- **Core Framework:** Next.js 14+ (App Router), React 18+, TypeScript 5.4+
- **UI Frameworks:** 
  - Material-UI (MUI v5) - Dùng cho Layout, Typography, Form, Buttons cơ bản.
  - Ant Design (Antd v5) - Dùng cho Data Display phức tạp (Table, Tree, DatePicker, Pagination).
- **Styling:** Emotion (đi kèm MUI), cấu hình Theme của MUI (ThemeProvider) và Antd (ConfigProvider). Sử dụng CSS Modules (`.module.css`) cho các custom style đặc thù.
- **Data Fetching/API:** SWR hoặc TanStack Query kết hợp Axios (Client-side) & Fetch API (Server-side).
- **Form & Validation:** React Hook Form + Zod.
- **Biểu tượng (Icons):** MUI Icons hoặc Lucide-React.

## 2. Project Structure (Next.js App Router)
Tuân thủ cấu trúc thư mục của Next.js (chú trọng chia component Client và Server).
```text
/
├── app/                  # Next.js App Router (Chứa các page, layout, loading, error)
│   ├── (auth)/           # Route group cho Auth (login, register...)
│   ├── dashboard/        # Route cho Dashboard
│   ├── layout.tsx        # Cấu hình Root Layout (bọc ThemeProvider của MUI & Antd)
│   └── page.tsx          # Trang chủ
├── src/
│   ├── components/       # CÁC COMPONENT DÙNG CHUNG
│   │   ├── ui-mui/       # Wrapper cho các component của MUI
│   │   └── ui-antd/      # Wrapper cho các component của Antd
│   ├── lib/              # Cấu hình thư viện (Axios, Zustand, Theme cấu hình chung...)
│   ├── hooks/            # Custom hooks
│   ├── services/         # Chứa các file gọi API (phân theo tính năng: auth.ts, user.ts...)
│   └── types/            # Định nghĩa TypeScript (Interfaces, Types)
└── public/               # Ảnh tĩnh, favicon, fonts...
```

## 3. Component Conventions (Next.js Specific)
- **Server vs Client Components:**
  - Mặc định mọi component trong `app/` là Server Component (tốt cho SEO, tốc độ).
  - Khi component cần tương tác người dùng (onClick, useState, UseEffect) HOẶC sử dụng components của MUI/Antd có chứa state bên trong, BẮT BUỘC thêm dòng `"use client";` ở đầu file.
- **Naming:** 
  - File chứa UI: `PascalCase.tsx` (VD: `UserProfile.tsx`).
  - File chứa logic, helper: `camelCase.ts` (VD: `fetcher.ts`).
- **Props Pattern:** 
  - Định nghĩa Type/Interface rõ ràng: `export function CustomTable({ data }: CustomTableProps) {...}`.

## 4. Design Tokens & Theming
Để project nhìn "chuyên nghiệp" và đồng nhất giữa 2 thư viện UI khác nhau:
- **Tập trung Color Palette:** Khai báo mã màu chung ở 1 nơi (Tạo file `themeConfig.ts`). Sau đó truyền palette này vào cả `createTheme` của MUI và `theme` của Antd ConfigProvider để 2 bên nhìn giống nhau.
- **Colors:**
  - Primary Color: Xanh dương chuẩn doanh nghiệp (Đồng bộ trên cả 2 UI Lib).
  - Background: Trắng/Xám nhạt (Paper: `#ffffff`, Default: `#f4f6f8`).
- **Typography:**
  - Thống nhất dùng Font (ví dụ: `Inter` hoặc `Roboto`). Cài đặt Next.js `next/font`.
- **Spacing:** Dùng prop `sx={{ p: 2, m: 1 }}` của MUI cho việc căn chỉnh khoảng cách, hạn chế viết CSS tay.

## 5. State Management Pattern
- **Server State (Dữ liệu từ API):** Sử dụng React Query (hoặc tính năng Server Actions & Fetch Cache của Next.js).
- **Global UI State:** Sử dụng `Zustand` cho các trạng thái nhẹ (VD: mở/đóng Sidebar toàn cục, lưu thông tin User sau login).
- **Local State:** `useState` thông thường trong các Client Component.

## 6. Important Rules (Hard Rules)
1. ** Rõ ràng ranh giới sử dụng UI Lib:** KHÔNG TRỘN LẪN lộn xộn. (Ví dụ: Tuyệt đối không để 1 trang có Nút Save của MUI và Nút Cancel của Antd). Quy ước rõ: cái nào MUI quản lý, cái nào Antd quản lý.
2. ** Xử lý SSR với Antd & MUI:** Next.js App Router render trên server nên CSS của MUI/Antd có thể bị mất ở lần load đầu tiên. Phải setup đúng tài liệu (setup Emotion cache cho MUI và `@ant-design/nextjs-registry` cho Antd).
3. ** Handling Loading/Error trong Next.js:** 
   - Tận dụng file `loading.tsx` và `error.tsx` của Next.js App Router cho trải nghiệm chuyển trang.
   - Khi load data Client-side, bắt buộc bọc form/table trong Skeleton (MUI/Antd đều có sẵn Skeleton/Spin).
4. ** Tối ưu SEO và Performance:** Sử dụng `next/image` (`<Image />`) cho hình ảnh, `next/link` (`<Link />`) cho chuyển trang.

## 7. Decision Log
| Ngày | Vấn đề | Quyết định (Decision) | Lý do chính |
| :--- | :--- | :--- | :--- |
| 10/10/2026 | Kiến trúc & Framework | Next.js App Router | Hỗ trợ full-stack, SEO tốt, loading page nhanh nhờ Server Components. |
| 11/10/2026 | Tổ chức UI Component | Kết hợp MUI (Base) + Antd (Data Grid/Date) | MUI có hệ thống Styling (sx) và Layout rất tốt, trong khi Antd cực mạnh về Table, Form phức tạp cho Admin Panel. Cần quản lý chặt Theme để đồng bộ thị giác. |
