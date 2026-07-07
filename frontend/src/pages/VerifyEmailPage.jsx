import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Notice } from "../components/States.jsx";
import { Button } from "../components/ui/Controls.jsx";

export default function VerifyEmailPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = location.state?.email || searchParams.get("email") || "";
  const [otp, setOtp] = useState(
    location.state?.otp || searchParams.get("otp") || searchParams.get("token") || "",
  );
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(
    location.state?.emailQueued
      ? "OTP đang được gửi. Hãy kiểm tra cả hộp thư Spam/Quảng cáo."
      : "",
  );
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!resendIn) return undefined;
    const timer = window.setInterval(
      () => setResendIn((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [resendIn]);

  async function verify() {
    if (!/^\d{6}$/.test(otp)) {
      setStatus("error");
      setMessage("OTP phải gồm đúng 6 chữ số.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      await api("/auth/verify-email", {
        method: "POST",
        body: { otp, ...(email ? { email } : {}) },
      });
      setStatus("success");
      setMessage("Tài khoản đã được xác nhận. Bạn có thể đăng nhập ngay.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  async function resend() {
    if (!email || resendIn) return;
    setStatus("loading");
    try {
      const result = await api("/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
      if (result.verificationOtp) setOtp(result.verificationOtp);
      setStatus("idle");
      setResendIn(60);
      setMessage("OTP mới đang được gửi tới email của bạn.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-72px)] place-items-center bg-zinc-50 px-5 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-2xl shadow-zinc-950/[.06] dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-3xl dark:bg-emerald-500/10">
          ✉
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Xác nhận email
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-.04em] text-zinc-950 dark:text-white">
          Nhập mã OTP của bạn
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Mã 6 chữ số có hiệu lực trong 10 phút và đã được gửi tới{" "}
          <strong className="text-zinc-800 dark:text-zinc-200">
            {email || "email đăng ký"}
          </strong>
          .
        </p>

        <div className="mt-6">
          <Notice type={status === "error" ? "error" : "success"}>{message}</Notice>
        </div>

        {status !== "success" ? (
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-left" htmlFor="verification-otp">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Mã OTP
              </span>
              <input
                id="verification-otp"
                className="min-h-16 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-center text-3xl font-black tracking-[.45em] text-zinc-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength="6"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
              />
            </label>
            <Button
              type="button"
              wide
              loading={status === "loading"}
              disabled={otp.length !== 6}
              onClick={verify}
            >
              Xác nhận tài khoản
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:text-zinc-400"
              disabled={!email || resendIn > 0 || status === "loading"}
              onClick={resend}
            >
              {resendIn ? `Gửi lại sau ${resendIn}s` : "Gửi lại OTP"}
            </button>
          </div>
        ) : (
          <Link
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-5 font-semibold text-white transition hover:bg-brand-700"
            to="/login"
          >
            Đến trang đăng nhập
          </Link>
        )}
      </div>
    </section>
  );
}
