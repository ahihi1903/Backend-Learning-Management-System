import { useEffect, useRef, useState } from "react";

const SCRIPT_ID = "google-identity-services";

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Không thể tải Google Sign-In"));
    document.head.appendChild(script);
  });
}

export default function GoogleButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || disabled) return undefined;
    let active = true;

    loadGoogleIdentity()
      .then(() => {
        if (!active || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => callbackRef.current?.(credential),
          cancel_on_tap_outside: true,
        });
        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: Math.min(containerRef.current.clientWidth || 360, 400),
        });
      })
      .catch((loadError) => active && setError(loadError.message));

    return () => {
      active = false;
    };
  }, [clientId, disabled]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        Google Sign-In sẽ hiển thị sau khi cấu hình VITE_GOOGLE_CLIENT_ID.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={disabled ? "pointer-events-none opacity-50" : ""}
        aria-label="Đăng nhập bằng Google"
      />
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
