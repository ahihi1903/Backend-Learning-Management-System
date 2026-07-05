import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { LoadingState } from "./components/States.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage.jsx"));
const CoursePage = lazy(() => import("./pages/CoursePage.jsx"));
const LessonPage = lazy(() => import("./pages/LessonPage.jsx"));
const TeacherPage = lazy(() => import("./pages/TeacherPage.jsx"));
const AdminPage = lazy(() => import("./pages/AdminPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

export default function App() {
  return (
    <Suspense fallback={<LoadingState label="Đang chuẩn bị không gian làm việc..." />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="courses/:courseId" element={<CoursePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="learn/:courseId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["teacher", "admin"]} />}>
            <Route path="teacher" element={<TeacherPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
