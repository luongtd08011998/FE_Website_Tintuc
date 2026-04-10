1.  API Post: http://localhost:8080/api/v1/qlkh/auth/login
    {
    "digiCode": "00800219",
    "phone": "0973123477"
    }
    {
    "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJjdXN0b21lcklkIjoyMzYxLCJzdWIiOiIwMDgwMDIxOSIsImRpZ2lDb2RlIjoiMDA4MDAyMTkiLCJleHAiOjE4NjIwNjMzNDQsImlhdCI6MTc3NTY2MzM0NH0.DGfoe8dFVjOIDdmEhv3mIKL-kI7hWz7CE6NwyJ7LIqc"
    },
    "message": "Đăng nhập thành công",
    "statusCode": 200
    }
2.  API Get: http://localhost:8080/api/v1/qlkh/invoices
    NHâpk token lấy từ api API Post: http://localhost:8080/api/v1/qlkh/auth/login
    "data": {
    "meta": {
    "page": 1,
    "pageSize": 20,
    "pages": 7,
    "total": 131
    },
    "result": [
    {
    "monthInvoiceId": 2370,
    "customerId": 2361,
    "yearMonth": "201412",
    "amount": 287600.0,
    "envFee": 28760.0,
    "taxFee": 14380.0,
    "invStatus": 1,
    "paymentStatus": 1,
    "paymentStatusLabel": "Đã thanh toán",
    "createdDate": "20141231",
    "startDate": "",
    "endDate": "",
    "oldVal": 626,
    "newVal": 664,
    "waterMeterSerial": "",
    "numOfHouseHold": 1
    }
    ]
    },
    "message": "Lấy danh sách hóa đơn thành công",
    "statusCode": 200
    }
3.  API GET: http://localhost:8080/api/v1/qlkh/invoices/9383
    nhập tokken lấy từ api API Post: http://localhost:8080/api/v1/qlkh/auth/login
    "data": {
    "monthInvoiceId": 9383,
    "customerId": 2361,
    "yearMonth": "201503",
    "amount": 99200.0,
    "envFee": 9920.0,
    "taxFee": 4960.0,
    "invStatus": 1,
    "paymentStatus": 1,
    "paymentStatusLabel": "Đã thanh toán",
    "createdDate": "20150129",
    "startDate": "",
    "endDate": "",
    "oldVal": 690,
    "newVal": 704,
    "waterMeterSerial": "",
    "numOfHouseHold": 1
    },
    "message": "Lấy chi tiết hóa đơn thành công",
    "statusCode": 200
    }
4.  api Get:http://localhost:8080/api/v1/qlkh/customers/me
    nhap token tu api API Post: http://localhost:8080/api/v1/qlkh/auth/login
    { "data": {
    "customerId": 2361,
    "code": "15HA - NHĐ",
    "digiCode": "00800219",
    "name": "NGUYỄN HỮU ĐỒNG",
    "shortName": "",
    "phone": "0973123477",
    "address": "Khu TĐC 15HA, Phường Phú Mỹ, TP Hồ Chí Minh",
    "email": "",
    "contactName": "",
    "contactPhone": "",
    "balance": 0.0,
    "status": 2,
    },
    "message": "Lấy thông tin khách hàng thành công",
    "statusCode": 200
    }
