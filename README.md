# 📚 LMS REST API

Backend REST API cho hệ thống quản lý học tập (Learning Management System),
xây dựng với Node.js, Express, MongoDB.

## 🚀 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (Access Token + Refresh Token)
- **Email**: Nodemailer + Gmail App Password
- **Validation**: Zod
- **Upload**: Multer
- **Logging**: Morgan + Winston
- **Deploy**: Render + MongoDB Atlas

## ✨ Tính năng

- Đăng ký / Đăng nhập với JWT
- Xác thực email, quên mật khẩu, đặt lại mật khẩu
- Refresh token tự động gia hạn session
- Phân quyền 3 cấp: Admin / Teacher / Student
- CRUD Category, Course, Lesson, Comment
- Ownership check — Teacher chỉ sửa được nội dung của mình
- Upload avatar
- Pagination, Search, Filter

## 🏃 Chạy local

### Yêu cầu
- Node.js >= 18
- MongoDB Atlas account (free)
- Gmail App Password

### Cài đặt

\`\`\`bash
git clone https://github.com/yourusername/lms-api.git
cd lms-api
npm install
cp .env.example .env
# Điền thông tin vào .env
npm run dev
\`\`\`

## 📁 Cấu trúc thư mục

\`\`\`
src/
├── controllers/    # Nhận req, gọi service, trả res
├── services/       # Business logic, DB query
├── models/         # Mongoose schema
├── routes/         # Định nghĩa endpoint
├── middlewares/    # auth, role, validate, error handler
├── validations/    # Zod schema
└── utils/          # jwt, hash, sendEmail, logger
\`\`\`

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | /api/auth/register | Đăng ký | Public |
| POST | /api/auth/login | Đăng nhập | Public |
| POST | /api/auth/refresh | Lấy access token mới | Cookie |
| POST | /api/auth/logout | Đăng xuất | Login |
| GET | /api/auth/verify-email/:token | Xác thực email | Public |
| POST | /api/auth/forgot-password | Quên mật khẩu | Public |
| POST | /api/auth/reset-password/:token | Đặt lại mật khẩu | Public |

### Category
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | /api/categories | Danh sách category | Public |
| POST | /api/categories | Tạo category | Admin |
| PUT | /api/categories/:id | Sửa category | Admin |
| DELETE | /api/categories/:id | Xóa category | Admin |

### Course
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | /api/courses | Danh sách course | Public |
| GET | /api/courses/:id | Chi tiết course | Public |
| GET | /api/courses/my/courses | Course của tôi | Teacher |
| POST | /api/courses | Tạo course | Teacher/Admin |
| PUT | /api/courses/:id | Sửa course | Owner/Admin |
| DELETE | /api/courses/:id | Xóa course | Owner/Admin |

### Lesson
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | /api/courses/:courseId/lessons | Danh sách lesson | Public |
| GET | /api/courses/:courseId/lessons/:id | Chi tiết lesson | Public |
| POST | /api/courses/:courseId/lessons | Tạo lesson | Teacher (owner) |
| PUT | /api/courses/:courseId/lessons/:id | Sửa lesson | Teacher (owner) |
| DELETE | /api/courses/:courseId/lessons/:id | Xóa lesson | Teacher (owner) |

### Comment
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | /api/lessons/:lessonId/comments | Danh sách comment | Public |
| POST | /api/lessons/:lessonId/comments | Đăng comment | Login |
| PUT | /api/lessons/:lessonId/comments/:id | Sửa comment | Owner/Admin |
| DELETE | /api/lessons/:lessonId/comments/:id | Xóa comment | Owner/Admin |

## 🌐 Deploy

API đang chạy tại: https://your-api.onrender.com

## 📝 Môi trường

Xem `.env.example` để biết các biến môi trường cần thiết.
