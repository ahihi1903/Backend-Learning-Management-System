# Production setup

## 1. Backend environment

Sao chép `backend/.env.example` thành `backend/.env` và cấu hình:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
TRUST_PROXY=true

MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=at_least_32_random_characters
JWT_REFRESH_SECRET=another_32_random_characters

EMAIL_USER=your-account@gmail.com
EMAIL_PASS=your_gmail_app_password

GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`EMAIL_PASS` phải là Gmail App Password. Không dùng mật khẩu đăng nhập Gmail.

## 2. Google Sign-In

Trong Google Cloud Console:

1. Tạo OAuth Client loại **Web application**.
2. Thêm local và domain Vercel vào **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://your-frontend.vercel.app`
3. Đặt cùng Client ID vào:
   - Backend: `GOOGLE_CLIENT_ID`
   - Frontend: `VITE_GOOGLE_CLIENT_ID`

Backend luôn xác minh chữ ký, audience, issuer và thời hạn của Google ID token.

## 3. Cloudinary video

Frontend xin signed upload parameters từ backend, sau đó upload file trực tiếp lên
Cloudinary. MongoDB chỉ lưu URL và metadata; Node.js không giữ file video lớn.

Đặt ba biến `CLOUDINARY_*` trên môi trường backend. Không đặt
`CLOUDINARY_API_SECRET` ở frontend.

## 4. Frontend environment (Vercel)

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
```

Sau khi đổi biến `VITE_*`, cần redeploy frontend vì Vite nhúng chúng tại build time.

## 5. Demo data

Tạo idempotent 3 khóa học, 9 lesson, quiz và assignment:

```powershell
cd backend
npm.cmd run seed:demo
```

Hoặc đặt `AUTO_SEED_DEMO=true` để backend tự bảo đảm dữ liệu demo tồn tại khi khởi động.
Sau lần đầu nên chuyển lại `false` để startup nhanh hơn.

## 6. Verify

```powershell
cd backend
npm.cmd test
npm.cmd audit

cd ../frontend
npm.cmd run build
```

Health check:

```text
GET /health/live
GET /health/ready
```

## 7. Lưu ý hiệu năng

- Đăng ký trả response ngay sau khi tạo user; email OTP được gửi nền.
- Login dùng lean query và atomic update cho refresh token.
- MongoDB dùng connection pool cấu hình qua `MONGO_MIN_POOL_SIZE` và
  `MONGO_MAX_POOL_SIZE`.
- Video dùng `preload="metadata"` và URL delivery tối ưu, không tải toàn bộ video
  khi vừa mở lesson.
