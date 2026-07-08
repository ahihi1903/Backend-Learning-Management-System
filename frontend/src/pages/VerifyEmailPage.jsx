import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Notice } from "../components/States.jsx";
import { Button } from "../components/ui/Controls.jsx";

function verificationBody(token, email) {
  const trimmed = token?.trim();
  return {
    ...(trimmed && /^\d{6}$/.test(trimmed) ? { otp: trimmed } : { token: trimmed }),
    ...(email ? { email } : {}),
  };
}

export default function VerifyEmailPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const email = location.state?.email || searchParams.get("email") || "";
  const token =
    location.state?.token ||
    searchParams.get("token") ||
    searchParams.get("otp") ||
    "";
  const verificationLink = location.state?.verificationLink || "";
  const [status, setStatus] = useState(token ? "loading" : "idle");
  const [message, setMessage] = useState(
    location.state?.emailQueued
      ? "Link xác minh đã được gửi. Hãy kiểm tra cả hộp thư Spam/Quảng cáo."
      : "",
  );
  const [resendIn, setResendIn] = useState(0);
  const verifiedOnce = useRef(false);

  useEffect(() => {
    if (!resendIn) return undefined;
    const timer = window.setInterval(
      () => setResendIn((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [resendIn]);

  async function verify(currentToken = token) {
    if (!currentToken) {
      setStatus("error");
      setMessage("Link xác minh không hợp lệ hoặc đã thiếu token.");
      return;
    }

    setStatus("loading");
    setMessage("Đang xác minh tài khoản của bạn...");
    try {
      await api("/auth/verify-email", {
        method: "POST",
        body: verificationBody(currentToken, email),
      });
      setStatus("success");
      setMessage("Tài khoản đã được xác minh. Bạn có thể đăng nhập ngay.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (!token || verifiedOnce.current) return;
    verifiedOnce.current = true;
    verify(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function resend() {
    if (!email || resendIn) return;
    setStatus("loading");
    setMessage("");
    try {
      await api("/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
      setStatus("idle");
      setResendIn(60);
      setMessage("Link xác minh mới đang được gửi tới email của bạn.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-72px)] place-items-center bg-zinc-50 px-5 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md animate-fade-up rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-2xl shadow-zinc-950/[.06] dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-3xl dark:bg-emerald-500/10">
          ✉️
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-brand-600">
          Xác minh email
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-.04em] text-zinc-950 dark:text-white">
          {token ? "Đang kiểm tra link xác minh" : "Kiểm tra hộp thư của bạn"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {token
            ? "Chúng tôi đang xác minh tài khoản từ liên kết bạn vừa mở."
            : "Bấm vào link xác minh đã được gửi tới"}{" "}
          {!token && (
            <strong className="text-zinc-800 dark:text-zinc-200">
              {email || "email đăng ký"}
            </strong>
          )}
          {!token && "."}
        </p>

        <div className="mt-6">
          <Notice type={status === "error" ? "error" : "success"}>{message}</Notice>
        </div>

        {status === "success" ? (
          <Link
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-5 font-semibold text-white transition hover:bg-brand-700"
            to="/login"
          >
            Đến trang đăng nhập
          </Link>
        ) : (
          <div className="mt-6 grid gap-3">
            {token && (
              <Button
                type="button"
                wide
                loading={status === "loading"}
                onClick={() => verify(token)}
              >
                Thử xác minh lại
              </Button>
            )}

            {verificationLink && (
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                href={verificationLink}
              >
                Mở link xác minh dev
              </a>
            )}

            <button
              type="button"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:text-zinc-400"
              disabled={!email || resendIn > 0 || status === "loading"}
              onClick={resend}
            >
              {resendIn ? `Gửi lại sau ${resendIn}s` : "Gửi lại link xác minh"}
            </button>
            <Link className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200" to="/login">
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
