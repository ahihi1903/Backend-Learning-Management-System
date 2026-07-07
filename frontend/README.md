# Northstar LMS Frontend

Frontend React + Vite + Tailwind CSS cho hệ thống LMS.

## Chạy local

```powershell
cd backend
npm.cmd start
```

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Mở `http://localhost:5173`.

## Environment

```env
# Để trống ở local nếu dùng Vite proxy.
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
```

## Production build

```powershell
npm.cmd run build
```

Kết quả nằm trong `dist/`.

## UI architecture

- `components/ui`: button, form field, dialog, skeleton.
- `components/auth`: auth layout và Google Sign-In.
- `components/media`: direct video upload và optimized video player.
- `context`: auth, theme và toast.
- `pages`: route-level component, được lazy load trong `App.jsx`.

Giao diện hỗ trợ responsive, keyboard focus, loading/empty/error states và dark mode.
Xem `../PRODUCTION_SETUP.md` để cấu hình deploy.
