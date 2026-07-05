# Northstar LMS Frontend

React + Vite frontend cho LMS API trong thư mục `backend`.

## Chạy local

Mở hai terminal:

```powershell
cd backend
npm.cmd start
```

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Truy cập `http://localhost:5173`.

## Luồng role

- Student: đăng ký, xác thực email, enrollment, học lesson, progress, quiz, assignment và comment.
- Teacher: tạo course/lesson, publish, tạo quiz/assignment, xem danh sách học viên.
- Admin: quản lý category, user và role; có quyền truy cập Teacher Studio.

## Production build

Frontend cần biết địa chỉ backend khi deploy độc lập. Tạo biến môi trường:

```env
VITE_API_URL=https://your-lms-api.onrender.com
```

Có thể dùng URL gốc hoặc URL kết thúc bằng `/api`; client sẽ tự chuẩn hóa. Trên Vercel, thêm biến này tại **Project Settings → Environment Variables** cho Production và Preview, sau đó redeploy.

Backend production cần tối thiểu:

```env
NODE_ENV=production
FRONTEND_URL=https://backend-learning-management-system-chi.vercel.app
TRUST_PROXY=true
```

`FRONTEND_URL` phải khớp chính xác origin frontend, không thêm path.

```powershell
npm.cmd run build
```

Kết quả nằm trong `dist/`. Khi chạy Docker, Nginx phục vụ SPA và proxy `/api` tới backend.
