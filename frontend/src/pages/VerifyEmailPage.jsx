import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { Notice } from "../components/States.jsx";

export default function VerifyEmailPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(
    searchParams.get("token") || location.state?.token || "",
  );
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function verify(value = token) {
    if (!value) return;
    setStatus("loading");
    try {
      await api("/auth/verify-email", {
        method: "POST",
        body: { token: value },
      });
      setStatus("success");
      setMessage("Email đã được xác thực. Bạn có thể đăng nhập ngay.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (searchParams.get("token")) verify(searchParams.get("token"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="center-page">
      <div className="verification-card">
        <span className="mail-orbit">✦</span>
        <span className="kicker">Xác thực email</span>
        <h1>Chỉ còn một bước nhỏ</h1>
        <p className="muted">
          Nhập token trong email đã gửi tới <strong>{location.state?.email || "địa chỉ của bạn"}</strong>.
        </p>
        <Notice type={status === "error" ? "error" : "success"}>{message}</Notice>
        {status !== "success" && (
          <div className="form-stack">
            <label>
              Verification token
              <textarea
                rows="3"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Dán token tại đây"
              />
            </label>
            <button className="button button-wide" onClick={() => verify()} disabled={!token || status === "loading"}>
              {status === "loading" ? "Đang xác thực..." : "Xác thực tài khoản"}
            </button>
          </div>
        )}
        {status === "success" && <Link className="button button-wide" to="/login">Đến trang đăng nhập</Link>}
      </div>
    </section>
  );
}
