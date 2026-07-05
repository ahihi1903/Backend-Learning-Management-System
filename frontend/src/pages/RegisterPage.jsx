import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { Notice } from "../components/States.jsx";
import { Button, FormField, PasswordField } from "../components/ui/Controls.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api("/auth/register", { method: "POST", body: form });
      navigate("/verify-email", {
        state: {
          email: form.email,
          token: result.verificationToken,
          emailSent: result.emailSent,
        },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page auth-page-reverse">
      <div className="auth-story">
        <span className="eyebrow">Bắt đầu từ hôm nay</span>
        <h1>Xây năng lực thật, theo nhịp của riêng bạn.</h1>
        <p>Khám phá khóa học, theo dõi tiến độ và luyện tập qua trắc nghiệm, bài tập.</p>
        <ul className="benefit-list">
          <li><span>01</span> Lộ trình học rõ ràng</li>
          <li><span>02</span> Tiến độ được lưu liên tục</li>
          <li><span>03</span> Phản hồi trực tiếp từ giảng viên</li>
        </ul>
      </div>
      <div className="auth-card">
        <div>
          <span className="kicker">Tạo tài khoản</span>
          <h2>Khởi động hành trình mới</h2>
          <p className="muted">Bạn sẽ bắt đầu với tài khoản học viên.</p>
        </div>
        <Notice type="error">{error}</Notice>
        <form onSubmit={handleSubmit} className="form-stack">
          <FormField label="Tên hiển thị" autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} minLength="3" maxLength="20" placeholder="minhnguyen" hint="Từ 3–20 ký tự" required />
          <FormField label="Email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required />
          <PasswordField label="Mật khẩu" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Ít nhất 8 ký tự, chữ hoa và số" hint="Ít nhất 8 ký tự, gồm chữ hoa và số" required />
          <Button type="submit" wide loading={submitting}>
            {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>
        </form>
        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </section>
  );
}
