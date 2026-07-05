import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Notice } from "../components/States.jsx";
import { Button, FormField, PasswordField } from "../components/ui/Controls.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form);
      const fallback = user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/";
      navigate(location.state?.from || fallback, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-story">
        <span className="eyebrow">Chào mừng trở lại</span>
        <h1>Tiếp tục hành trình bạn đã bắt đầu.</h1>
        <p>Một bài học nhỏ hôm nay có thể mở ra một cánh cửa rất lớn ngày mai.</p>
        <div className="quote-card">
          <span>“</span>
          <p>Kiến thức tốt nhất là kiến thức được biến thành năng lực.</p>
        </div>
      </div>
      <div className="auth-card">
        <div>
          <span className="kicker">Đăng nhập</span>
          <h2>Rất vui được gặp lại bạn</h2>
          <p className="muted">Nhập tài khoản để tiếp tục học tập.</p>
        </div>
        <Notice type="error">{error}</Notice>
        <form onSubmit={handleSubmit} className="form-stack">
          <FormField label="Email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required />
          <PasswordField label="Mật khẩu" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" required />
          <Button type="submit" wide loading={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
        </p>
      </div>
    </section>
  );
}
