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

```powershell
npm.cmd run build
```

Kết quả nằm trong `dist/`. Khi chạy Docker, Nginx phục vụ SPA và proxy `/api` tới backend.
