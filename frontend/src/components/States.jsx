import { AlertCircleIcon, CompassIcon, RefreshIcon } from "./Icons.jsx";
import { Button } from "./ui/Controls.jsx";

export function LoadingState({ label = "Đang tải dữ liệu..." }) {
  return (
    <div
      className="mx-auto grid min-h-[45vh] max-w-lg place-items-center px-5 text-center"
      role="status"
      aria-live="polite"
    >
      <div>
        <span className="mx-auto block size-10 animate-spin rounded-full border-[3px] border-emerald-100 border-r-brand-600 dark:border-emerald-950 dark:border-r-emerald-400" />
        <p className="mt-5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <span className="sr-only">Vui lòng chờ</span>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div
      className="mx-auto my-10 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/60 dark:bg-red-950/30"
      role="alert"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-red-600 shadow-sm dark:bg-red-950 dark:text-red-300">
        <AlertCircleIcon size={22} />
      </span>
      <h2 className="mt-5 text-xl font-bold text-zinc-950 dark:text-white">
        Chưa thể tải dữ liệu
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        {error?.message || "Có lỗi xảy ra, vui lòng thử lại."}
      </p>
      {onRetry && (
        <Button className="mt-6" onClick={onRetry}>
          <RefreshIcon size={16} /> Thử lại
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/70 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        <CompassIcon size={22} />
      </span>
      <h3 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({ type = "success", tone = "default", children }) {
  if (!children) return null;
  const isError = type === "error";
  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
        tone === "dark"
          ? isError
            ? "border-red-400/20 bg-red-400/10 text-red-200"
            : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : isError
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
            : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
      }`}
      role={isError ? "alert" : "status"}
      aria-live="polite"
    >
      {children}
    </div>
  );
}
