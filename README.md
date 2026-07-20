# DevJobs Vietnam 🚀

Website tuyển dụng và quản lý hồ sơ IT toàn diện, được xây dựng bằng **Express / TypeScript** cho Backend và **Next.js / TypeScript / Vanilla CSS** cho Frontend.

Dự án hỗ trợ đầy đủ các tính năng cho cả **Ứng viên (Candidate)** (tạo hồ sơ, tìm kiếm việc làm, lưu việc, nộp CV) và **Nhà tuyển dụng (Company)** (đăng tuyển, xem pipeline, gửi thư mời phỏng vấn, gửi offer, quản lý hồ sơ ứng tuyển).

---

## 🛠 Công nghệ sử dụng

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT Auth, Nodemailer, Helmet, Joi Validation.
- **Frontend**: Next.js (App Router), React, TypeScript, Vanilla CSS (Thiết kế hiện đại, responsive, hỗ trợ dark/light theme linh hoạt).

---

## 📁 Cấu trúc thư mục

```txt
my-recruitment-app/
├── backend/          # RESTful API (Express + TypeScript)
│   ├── config/       # Kết nối database
│   ├── controllers/  # Logic điều hướng và xử lý chính
│   ├── middlewares/  # Xác thực, bảo mật, giới hạn rate limit
│   ├── models/       # Định nghĩa lược đồ MongoDB (Mongoose)
│   ├── routes/       # Khai báo đường dẫn API
│   ├── services/     # Dịch vụ gửi email, mã hóa token
│   └── validates/    # Xác thực dữ liệu đầu vào (Joi)
├── frontend/         # Giao diện người dùng (Next.js)
│   ├── app/          # App router (dashboard, jobs, verify, auth...)
│   ├── components/   # Các component React tái sử dụng
│   ├── data/         # Mock data & cấu hình tĩnh
│   └── lib/          # Helper, gọi API client
└── package.json      # Cấu hình quản lý Workspace npm
```

---

## ⚡ Hướng dẫn cài đặt & Chạy dưới Local

### 1. Cài đặt Dependencies
Dự án sử dụng tính năng **npm workspaces**, vì vậy bạn chỉ cần chạy cài đặt một lần tại thư mục gốc:
```bash
npm install
```

### 2. Cấu hình biến môi trường (`.env`)

#### Phía Backend:
Tạo file `backend/.env` với các nội dung sau:
```env
PORT=4000
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/recruitment_db
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret

# Địa chỉ Client Frontend
FRONTEND_URL=http://localhost:3000
```


### 3. Khởi chạy dự án
Chạy lệnh sau tại thư mục gốc để bắt đầu chạy đồng thời cả frontend và backend ở chế độ phát triển (development):
```bash
npm run dev
```
- **Frontend** chạy tại: [http://localhost:3000](http://localhost:3000)
- **Backend API** chạy tại: [http://localhost:4000](http://localhost:4000)

---

## ✉️ Tính năng Xác thực Email (Email Verification Flow)

Hệ thống bắt buộc ứng viên và nhà tuyển dụng phải xác thực địa chỉ email trước khi có thể đăng nhập.

### Luồng hoạt động:
1. **Đăng ký**: Người dùng điền thông tin và đăng ký. Hệ thống lưu tài khoản với trạng thái `isEmailVerified: false`, tạo ra một token xác thực duy nhất (đã được mã hóa SHA-256) hết hạn trong 24 giờ.
2. **Gửi email**: Hệ thống gửi email tự động chứa liên kết có cấu trúc:
   ```text
   http://localhost:3000/verify?token=<raw_token>
   ```
3. **Xác thực**:
   - Khi người dùng click vào liên kết, Next.js sẽ chuyển tới trang `/verify`.
   - Trang `/verify` của frontend lấy token từ query, gọi API backend: `GET /api/auth/verify?token=...`.
   - Backend băm token nhận được, tìm kiếm người dùng trùng khớp trong database và cập nhật `isEmailVerified: true`.
   - Frontend hiển thị thông báo thành công và đếm ngược tự động chuyển hướng về trang Đăng nhập `/login`.

### ⚠️ Lưu ý quan trọng khi kiểm thử:
- **Thư rác (Spam / Promotions)**: Vì liên kết xác minh trỏ về địa chỉ IP cục bộ `localhost`, các bộ lọc bảo mật của Gmail/Yahoo thường đánh giá đây là thư rác hoặc thư quảng cáo. Hãy kiểm tra kỹ thư mục **Spam (Thư rác)** hoặc **Promotions (Quảng cáo)** nếu không thấy thư về Hộp thư chính.

---

## 🔑 Tính năng Quên & Đặt lại mật khẩu (Password Reset Flow)

Hệ thống cho phép người dùng tự khôi phục mật khẩu thông qua địa chỉ email đã đăng ký.

### Luồng hoạt động:
1. **Yêu cầu khôi phục**: Người dùng vào trang đăng nhập, click **Quên mật khẩu?**, điền email và gửi.
2. **Tạo token & gửi mail**:
   - Backend tạo mã ngẫu nhiên và băm mã lưu vào DB kèm thời hạn hết hạn 1 giờ (`passwordResetExpires`).
   - Gửi một email bảo mật chứa liên kết khôi phục tới hòm thư người dùng:
     ```text
     http://localhost:3000/reset-password?token=<reset_token>
     ```
3. **Đặt lại mật khẩu**:
   - Người dùng click vào liên kết và được dẫn tới trang `/reset-password` trên Next.js.
   - Nhập mật khẩu mới (kiểm tra độ mạnh và khớp mật khẩu).
   - Gửi yêu cầu cập nhật lên backend. Backend xác minh token, cập nhật mật khẩu đã băm mới, xóa token reset cũ, và tăng `tokenVersion` lên 1 (hành động này tự động đăng xuất tất cả phiên đăng nhập cũ trên mọi thiết bị khác của người dùng đó).
   - Tự động đếm ngược 5 giây và chuyển hướng về trang Đăng nhập `/login`.

