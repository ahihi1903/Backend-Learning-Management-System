import { AlertCircleIcon, CompassIcon, RefreshIcon } from "./Icons.jsx";

export function LoadingState({ label = "Đang tải dữ liệu..." }) {
  return (
    <div className="state-panel state-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true"><i /></span>
      <p>{label}</p>
      <span className="sr-only">Vui lòng chờ</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-panel state-error" role="alert">
      <span className="state-icon" aria-hidden="true"><AlertCircleIcon size={22} /></span>
      <h2>Chưa thể tải dữ liệu</h2>
      <p>{error?.message || "Có lỗi xảy ra, vui lòng thử lại."}</p>
      {onRetry && (
        <button className="button" onClick={onRetry}>
          <RefreshIcon size={16} /> Thử lại
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state state-empty">
      <span className="state-icon" aria-hidden="true"><CompassIcon size={22} /></span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function Notice({ type = "success", children }) {
  if (!children) return null;
  return (
    <div className={`notice notice-${type}`} role={type === "error" ? "alert" : "status"} aria-live="polite">
      {children}
    </div>
  );
}
