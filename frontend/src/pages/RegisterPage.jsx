import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Notice } from "../components/States.jsx";
import { Button, FormField, PasswordField } from "../components/ui/Controls.jsx";
import SocialLoginOptions from "../components/auth/SocialLoginOptions.jsx";
import { requestGoogleCredential } from "../components/auth/GoogleButton.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
          verificationLink: result.verificationLink,
          emailQueued: result.emailQueued,
        },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const handleGoogle = useCallback(async () => {
    setError("");
    setSubmitting(true);
    try {
      const credential = await requestGoogleCredential(googleClientId);
      await loginWithGoogle(credential);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }, [googleClientId, loginWithGoogle, navigate]);

  return (
    <AuthShell
      eyebrow="Bắt đầu từ hôm nay"
      title="Xây năng lực thật, theo nhịp của riêng bạn."
      description="Khám phá khóa học, thực hành qua bài tập và nhìn thấy tiến bộ của mình sau từng bài học."
      highlights={["Học trên mọi thiết bị", "Theo dõi tiến độ", "Nội dung thực chiến"]}
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-brand-600 hover:text-brand-700" to="/login">
            Đăng nhập
          </Link>
        </>
      }
    >
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Tạo tài khoản
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-zinc-950 dark:text-white">
          Khởi động hành trình mới
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Đăng ký bằng email, sau đó bấm link xác minh được gửi tới hộp thư.
        </p>
      </div>

      <Notice type="error">{error}</Notice>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <FormField
          label="Tên hiển thị"
          autoComplete="username"
          value={form.username}
          onChange={(event) => setForm({ ...form, username: event.target.value })}
          minLength="3"
          maxLength="20"
          placeholder="minhnguyen"
          hint="Từ 3–20 ký tự"
          required
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="you@example.com"
          required
        />
        <PasswordField
          label="Mật khẩu"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="Ít nhất 8 ký tự"
          hint="Gồm chữ hoa, chữ thường và chữ số"
          required
        />
        <Button type="submit" wide loading={submitting}>
          {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>

      <SocialLoginOptions
        action="Đăng ký"
        onGoogle={handleGoogle}
        disabled={submitting}
        googleDisabled={!googleClientId}
      />
    </AuthShell>
  );
}
