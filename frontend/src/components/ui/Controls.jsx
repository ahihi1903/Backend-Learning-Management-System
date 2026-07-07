import { forwardRef, useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "../Icons.jsx";

const buttonVariants = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-emerald-900/10 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-emerald-900/15",
  secondary:
    "border border-zinc-200 bg-white text-zinc-800 shadow-sm hover:-translate-y-0.5 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
  danger:
    "bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-700",
};

const darkButtonVariants = {
  primary:
    "bg-emerald-400 text-emerald-950 shadow-sm shadow-emerald-950/20 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-950/20",
  secondary:
    "border border-white/10 bg-white/[.055] text-zinc-100 shadow-sm hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.09]",
  ghost: "text-zinc-300 hover:bg-white/[.07] hover:text-white",
  danger:
    "bg-red-500 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-400",
};

export const Button = forwardRef(function Button(
  {
    children,
    className = "",
    variant = "primary",
    wide = false,
    loading = false,
    tone = "default",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-55 ${
        tone === "dark"
          ? darkButtonVariants[variant] || darkButtonVariants.primary
          : buttonVariants[variant] || buttonVariants.primary
      } ${wide ? "w-full" : ""} ${className}`}
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});

export function FormField({
  label,
  hint,
  error,
  id,
  className = "",
  tone = "default",
  ...inputProps
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const descriptionId = `${fieldId}-description`;
  return (
    <label className={`grid gap-2 ${className}`} htmlFor={fieldId}>
      <span
        className={`text-sm font-semibold ${
          tone === "dark" ? "text-zinc-200" : "text-zinc-800 dark:text-zinc-100"
        }`}
      >
        {label}
      </span>
      <input
        id={fieldId}
        className={
          tone === "dark"
            ? "min-h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-[15px] text-zinc-100 outline-none transition placeholder:text-zinc-500 hover:border-white/15 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-500/10"
            : "min-h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-brand-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-600"
        }
        aria-describedby={hint || error ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
      {(hint || error) && (
        <small
          id={descriptionId}
          className={`text-xs ${
            error
              ? tone === "dark"
                ? "text-red-300"
                : "text-red-600"
              : tone === "dark"
                ? "text-zinc-500"
                : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {error || hint}
        </small>
      )}
    </label>
  );
}

export function PasswordField({
  label = "Mật khẩu",
  hint,
  error,
  id,
  tone = "default",
  ...inputProps
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const descriptionId = `${fieldId}-description`;
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-2" htmlFor={fieldId}>
      <span
        className={`text-sm font-semibold ${
          tone === "dark" ? "text-zinc-200" : "text-zinc-800 dark:text-zinc-100"
        }`}
      >
        {label}
      </span>
      <span className="relative block">
        <input
          id={fieldId}
          className={
            tone === "dark"
              ? "min-h-12 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 pr-12 text-[15px] text-zinc-100 outline-none transition placeholder:text-zinc-500 hover:border-white/15 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-500/10"
              : "min-h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-[15px] text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-brand-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-zinc-600"
          }
          type={visible ? "text" : "password"}
          aria-describedby={hint || error ? descriptionId : undefined}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        <button
          className={`absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-zinc-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            tone === "dark"
              ? "hover:bg-white/[.07] hover:text-white"
              : "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
          type="button"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </span>
      {(hint || error) && (
        <small
          id={descriptionId}
          className={`text-xs ${
            error
              ? tone === "dark"
                ? "text-red-300"
                : "text-red-600"
              : tone === "dark"
                ? "text-zinc-500"
                : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {error || hint}
        </small>
      )}
    </label>
  );
}
