Xác thực
/login: Trang công khai cho người dùng đăng nhập. Tương ứng với POST /auth/login.
/register: Trang công khai cho đăng ký người dùng mới. Tương ứng với POST /auth/register.
Trang quản trị (Dashboard - Yêu cầu xác thực)
Khu vực này sẽ được bảo vệ, ví dụ đặt dưới route /dashboard.

/dashboard: Trang tổng quan chính sau khi người dùng đăng nhập.

Quản lý Người dùng (Users)

/dashboard/users: Hiển thị bảng danh sách tất cả người dùng.
API: GET /users (hỗ trợ phân trang).
/dashboard/users/create: Form để tạo người dùng mới.
API: POST /users.
/dashboard/users/edit/[id]: Form để chỉnh sửa thông tin người dùng đã có.
API: GET /users/{id} để lấy dữ liệu và PUT /users để cập nhật.

Quản lý Công ty (Companies)

/dashboard/companies: Hiển thị bảng danh sách tất cả các công ty.
API: GET /companies.
/dashboard/companies/create: Form để tạo công ty mới.
API: POST /companies.
/dashboard/companies/edit/[id]: Form để chỉnh sửa thông tin công ty.
API: GET /companies/{id} và PUT /companies.
Quản lý Vai trò (Roles)

/dashboard/roles: Hiển thị bảng danh sách các vai trò của người dùng.
API: GET /roles.
/dashboard/roles/create: Form để tạo vai trò mới và gán quyền.
API: POST /roles.
/dashboard/roles/edit/[id]: Form để chỉnh sửa vai trò đã có.
API: GET /roles/{id} và PUT /roles.
Quản lý Quyền (Permissions)

/dashboard/permissions: Hiển thị bảng danh sách tất cả các quyền có sẵn.
API: GET /permissions.
/dashboard/permissions/create: Form để tạo quyền mới.
API: POST /permissions.
/dashboard/permissions/edit/[id]: Form để chỉnh sửa quyền đã có.
API: GET /permissions/{id} và PUT /permissions.
Quản lý Thẻ (Tags)
