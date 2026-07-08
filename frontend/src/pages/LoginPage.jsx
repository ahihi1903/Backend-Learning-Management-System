import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Notice } from "../components/States.jsx";
import { Button, FormField, PasswordField } from "../components/ui/Controls.jsx";
import SocialLoginOptions from "../components/auth/SocialLoginOptions.jsx";
import { requestGoogleCredential } from "../components/auth/GoogleButton.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const finishLogin = useCallback(
    (user) => {
      const fallback =
        user.role === "admin"
          ? "/admin"
          : user.role === "teacher"
            ? "/teacher"
            : "/";
      navigate(location.state?.from || fallback, { replace: true });
    },
    [location.state, navigate],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      finishLogin(await login(form));
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
      finishLogin(await loginWithGoogle(credential));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }, [finishLogin, googleClientId, loginWithGoogle]);

  return (
    <AuthShell
      eyebrow="Chào mừng trở lại"
      title="Tiếp tục hành trình bạn đã bắt đầu."
      description="Mỗi phiên học ngắn đều đưa bạn gần hơn đến năng lực có thể sử dụng trong công việc thật."
      highlights={["Lộ trình rõ ràng", "Tiến độ liên tục", "Thực hành có phản hồi"]}
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link className="font-semibold text-brand-600 hover:text-brand-700" to="/register">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Đăng nhập
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-[-.035em] text-zinc-950 dark:text-white">
          Rất vui được gặp lại bạn
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Dùng email hoặc tiếp tục nhanh bằng tài khoản mạng xã hội.
        </p>
      </div>

      <Notice type="error">{error}</Notice>

      <form onSubmit={handleSubmit} className="grid gap-5">
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
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="••••••••"
          required
        />
        <Button type="submit" wide loading={submitting}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <SocialLoginOptions
        action="Đăng nhập"
        onGoogle={handleGoogle}
        disabled={submitting}
        googleDisabled={!googleClientId}
      />
    </AuthShell>
  );
}
