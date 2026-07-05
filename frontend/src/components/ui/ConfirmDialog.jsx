import { useEffect, useRef } from "react";
import { AlertCircleIcon, CloseIcon } from "../Icons.jsx";
import { Button } from "./Controls.jsx";

export default function ConfirmDialog({ open, title, description, confirmLabel = "Xác nhận", cancelLabel = "Hủy", danger = false, loading = false, onConfirm, onCancel }) {
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
    <div className="dialog-layer" role="presentation">
      <button className="dialog-backdrop" type="button" aria-label="Đóng hộp thoại" onClick={loading ? undefined : onCancel} />
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
        <button className="dialog-close" type="button" aria-label="Đóng" disabled={loading} onClick={onCancel}><CloseIcon size={18} /></button>
        <span className={`dialog-symbol ${danger ? "danger" : ""}`} aria-hidden="true"><AlertCircleIcon size={23} /></span>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{description}</p>
        <div className="dialog-actions">
          <Button type="button" variant="secondary" disabled={loading} onClick={onCancel}>{cancelLabel}</Button>
          <Button ref={confirmRef} type="button" className={danger ? "button-danger" : ""} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}
