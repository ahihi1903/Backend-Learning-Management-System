import { useEffect, useRef } from "react";
import { AlertCircleIcon, CloseIcon } from "../Icons.jsx";
import { Button } from "./Controls.jsx";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[170] grid place-items-center p-5">
      <button
        className="absolute inset-0 size-full bg-zinc-950/70 backdrop-blur-md"
        type="button"
        aria-label="Đóng hộp thoại"
        onClick={loading ? undefined : onCancel}
      />
      <section
        className="relative w-full max-w-md animate-fade-up rounded-3xl border border-zinc-200 bg-white p-7 shadow-2xl shadow-black/30 dark:border-zinc-800 dark:bg-zinc-900"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <button
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 dark:hover:bg-zinc-800 dark:hover:text-white"
          type="button"
          aria-label="Đóng"
          disabled={loading}
          onClick={onCancel}
        >
          <CloseIcon size={18} />
        </button>
        <span
          className={`grid size-12 place-items-center rounded-2xl ${
            danger
              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          }`}
          aria-hidden="true"
        >
          <AlertCircleIcon size={23} />
        </span>
        <h2
          id="confirm-dialog-title"
          className="mt-5 pr-8 text-xl font-black tracking-[-.03em] text-zinc-950 dark:text-white"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
        >
          {description}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            type="button"
            variant={danger ? "danger" : "primary"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
