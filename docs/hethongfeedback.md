Hệ thống Phản hồi Staff — Mô tả API cho FE
Tổng quan
Hệ thống phản ánh/phản hồi gồm 2 phía:

Mobile (Customer): Khách hàng gửi phản ánh về dịch vụ nước
Admin (Staff): Staff quản lý, cập nhật trạng thái và phản hồi lại khách hàng

1. Enum Reference
   FeedbackStatus (trạng thái xử lý): PENDING, PROCESSING, RESOLVED, REJECTED

IssueType (loại vấn đề): LEAK (rò rỉ), QUALITY (chất lượng nước), PRESSURE (áp lực nước), OUTAGE (cắt nước), BILLING (thanh toán), METER (đồng hồ), OTHER (khác)

2. Customer gửi phản ánh (Mobile) — /api/v1/qlkh/customer/feedbacks
   2.1. POST /api/v1/qlkh/customer/feedbacks — Gửi phản ánh mới
   Auth: Bearer token QLKH (login qua /api/v1/qlkh/auth/login)

Content-Type: multipart/form-data

Field Type Required Mô tả
issueType String Có LEAK, QUALITY, PRESSURE, OUTAGE, BILLING, METER, OTHER
location String Có Địa chỉ/vị trí phát sinh vấn đề
description String Có Mô tả chi tiết vấn đề
images hoặc image hoặc upload_image File[] Không Ảnh đính kèm (hỗ trợ nhiều tên field)
Response 200:

{
"statusCode": 200,
"message": "Gửi phản ánh thành công",
"data": {
"trackingCode": "FB-20260428-001"
}
}
2.2. GET /api/v1/qlkh/customer/feedbacks — Xem danh sách phản ánh của KH
Auth: Bearer token QLKH

Response 200:

{
"statusCode": 200,
"message": "Lấy danh sách phản ánh thành công",
"data": [
{
"id": 1,
"trackingCode": "FB-20260428-001",
"issueType": "LEAK",
"location": "123 Nguyễn Huệ, Quận 1",
"description": "Ống nước rò rỉ trước nhà từ 2 ngày nay...",
"status": "PROCESSING",
"images": ["https://example.com/uploads/fb1-img1.jpg"],
"createdAt": "2026-04-28T10:00:00"
},
{
"id": 2,
"trackingCode": "FB-20260429-003",
"issueType": "BILLING",
"location": "456 Lê Lợi, Quận 3",
"description": "Hóa đơn tháng 4 cao bất thường...",
"status": "PENDING",
"images": [],
"createdAt": "2026-04-29T08:30:00"
}
]
} 3. Admin quản lý & phản hồi Staff — /api/v1/admin/feedbacks
Auth: Bearer token Admin (OAuth2 JWT)

3.1. GET /api/v1/admin/feedbacks/statistics — Thống kê phản ánh (Dashboard)
Dùng để hiển thị cards/biểu đồ trên trang dashboard admin.

Response 200:

{
"statusCode": 200,
"message": "Lấy thống kê phản ánh thành công",
"data": {
"byStatus": {
"PENDING": 10,
"PROCESSING": 5,
"RESOLVED": 20,
"REJECTED": 2
},
"byIssueType": {
"LEAK": 8,
"QUALITY": 3,
"PRESSURE": 2,
"OUTAGE": 1,
"BILLING": 2,
"METER": 1,
"OTHER": 0
},
"trendCounts": {
"last7Days": 5,
"last30Days": 18
},
"hotspotLocations": [
{ "location": "Quận 1, TP.HCM", "count": 5 },
{ "location": "Quận 3, TP.HCM", "count": 3 },
{ "location": "Quận 7, TP.HCM", "count": 2 }
]
}
}
Dùng để hiển thị:

Card: số lượng theo từng status (PENDING/PROCESSING/RESOLVED/REJECTED)
Biểu đồ tròn: phân bổ theo loại vấn đề (byIssueType)
Card xu hướng: số phản ánh 7 ngày / 30 ngày gần đây (trendCounts)
Bảng/heat map: các khu vực nóng (hotspotLocations)
3.2. GET /api/v1/admin/feedbacks — Danh sách phản ánh (phân trang + lọc)
Query params:

Param Type Mô tả
keyword String Tìm theo nội dung mô tả
status String PENDING, PROCESSING, RESOLVED, REJECTED
issueType String LEAK, QUALITY, PRESSURE, OUTAGE, BILLING, METER, OTHER
customerSearch String Tìm theo tên hoặc số điện thoại khách hàng
createdFrom DateTime Lọc từ ngày (ISO: 2026-04-01T00:00:00)
createdTo DateTime Lọc đến ngày
page int Trang (bắt đầu từ 0)
size int Số item/trang
sort String Sắp xếp, vd: createdAt,desc
Response 200:

{
"statusCode": 200,
"message": "Lấy danh sách phản ánh thành công",
"data": {
"meta": { "page": 1, "pageSize": 10, "pages": 5, "total": 48 },
"result": [
{
"id": 1,
"trackingCode": "FB-20260428-001",
"customer": {
"customerId": 123,
"digiCode": "KH001",
"name": "Nguyễn Văn A",
"phone": "0901234567",
"email": "nguyenvana@email.com"
},
"issueType": "LEAK",
"location": "123 Nguyễn Huệ, Quận 1, TP.HCM",
"description": "Ống nước rò rỉ trước nhà từ 2 ngày nay, nước chảy ra đường rất lãng phí.",
"status": "PROCESSING",
"replyCount": 2,
"images": [
"https://example.com/uploads/fb1-img1.jpg",
"https://example.com/uploads/fb1-img2.jpg"
],
"createdAt": "2026-04-28T10:00:00",
"updatedAt": "2026-04-28T14:30:00"
}
]
}
}
3.3. GET /api/v1/admin/feedbacks/{id} — Chi tiết phản ánh
Trả về full detail kèm danh sách phản hồi (replies).

Response 200:

{
"statusCode": 200,
"message": "Lấy chi tiết phản ánh thành công",
"data": {
"id": 1,
"trackingCode": "FB-20260428-001",
"customer": {
"customerId": 123,
"digiCode": "KH001",
"name": "Nguyễn Văn A",
"phone": "0901234567",
"email": "nguyenvana@email.com",
"address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
},
"issueType": "LEAK",
"location": "123 Nguyễn Huệ, Quận 1, TP.HCM",
"description": "Ống nước rò rỉ trước nhà từ 2 ngày nay...",
"status": "PROCESSING",
"images": ["https://example.com/uploads/fb1-img1.jpg"],
"replies": [
{
"id": 1,
"staff": {
"id": 5,
"name": "Trần Văn B",
"email": "tranb@company.com",
"avatar": "https://example.com/avatars/staff5.jpg"
},
"content": "Chúng tôi đã tiếp nhận phản ánh và sẽ cử nhân viên xuống kiểm tra trong 24h.",
"createdAt": "2026-04-28T11:00:00"
},
{
"id": 2,
"staff": {
"id": 5,
"name": "Trần Văn B",
"email": "tranb@company.com",
"avatar": "https://example.com/avatars/staff5.jpg"
},
"content": "Đã sửa xong ống rò rỉ. Vui lòng kiểm tra lại.",
"createdAt": "2026-04-29T09:00:00"
}
],
"createdAt": "2026-04-28T10:00:00",
"updatedAt": "2026-04-29T09:00:00"
}
}
3.4. PUT /api/v1/admin/feedbacks/{id}/status — Staff cập nhật trạng thái
Request body:

{
"status": "RESOLVED"
}
Giá trị hợp lệ: PENDING, PROCESSING, RESOLVED, REJECTED

Response 200: FeedbackAdminResponse (giống format item trong danh sách 3.2)

3.5. POST /api/v1/admin/feedbacks/{id}/replies — Staff thêm phản hồi
Staff gõ phản hồi gửi cho khách hàng.

Request body:

{
"content": "Chúng tôi đã tiếp nhận và sẽ xử lý trong thời gian sớm nhất. Xin cảm ơn!"
}
Validation
content Bắt buộc, tối đa 2000 ký tự
Response 201:

{
"statusCode": 201,
"message": "Thêm phản hồi thành công",
"data": {
"id": 3,
"staff": {
"id": 5,
"name": "Trần Văn B",
"email": "tranb@company.com",
"avatar": "https://example.com/avatars/staff5.jpg"
},
"content": "Chúng tôi đã tiếp nhận và sẽ xử lý trong thời gian sớm nhất. Xin cảm ơn!",
"createdAt": "2026-04-28T15:00:00"
}
}
Lưu ý: Staff info (name, email, avatar) được tự động lấy từ JWT token của staff đang đăng nhập, FE không cần gửi.

3.6. GET /api/v1/admin/feedbacks/{id}/replies — Danh sách phản hồi của 1 phản ánh
Response 200:

{
"statusCode": 200,
"message": "Lấy danh sách phản hồi thành công",
"data": [
{
"id": 1,
"staff": { "id": 5, "name": "Trần Văn B", "email": "tranb@company.com", "avatar": "..." },
"content": "Phản hồi 1...",
"createdAt": "2026-04-28T11:00:00"
},
{
"id": 2,
"staff": { "id": 7, "name": "Lê Thị C", "email": "lec@company.com", "avatar": "..." },
"content": "Phản hồi 2...",
"createdAt": "2026-04-29T09:00:00"
}
]
} 4. Flow tổng kết
Customer (Mobile) Admin (Staff)
│ │
├── POST /qlkh/customer/feedbacks ──► (nhận phản ánh mới)
│ Gửi phản ánh + ảnh │
│ ├── GET /admin/feedbacks/statistics
│ │ (xem thống kê dashboard)
│ │
│ ├── GET /admin/feedbacks
│ │ (danh sách, lọc, phân trang)
│ │
│ ├── GET /admin/feedbacks/{id}
│ │ (xem chi tiết + replies)
│ │
│ ├── PUT /admin/feedbacks/{id}/status
│ │ (cập nhật PENDING → PROCESSING → RESOLVED)
│ │
│ ├── POST /admin/feedbacks/{id}/replies
│ ◄── GET /qlkh/customer/feedbacks ── │ (staff viết phản hồi)
│ (KH xem lại trạng thái + phản hồi) │
