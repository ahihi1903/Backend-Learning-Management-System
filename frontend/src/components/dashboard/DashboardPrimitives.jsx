import { Link } from "react-router-dom";

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const dashboardInputClass =
  "min-h-11 w-full rounded-2xl border border-white/10 bg-white/[.045] px-4 text-sm text-zinc-100 outline-none transition duration-200 placeholder:text-zinc-500 hover:border-white/15 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-500/10";

export const dashboardTextareaClass = cx(
  dashboardInputClass,
  "min-h-28 py-3 leading-6",
);

export const dashboardSelectClass =
  "min-h-11 rounded-2xl border border-white/10 bg-[#0b0f14] px-3 text-sm font-semibold text-zinc-100 outline-none transition duration-200 hover:border-white/20 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-500/10";

// Short aliases keep page markup readable while the descriptive names remain
// available to components outside the dashboard pages.
export const inputClass = dashboardInputClass;
export const selectClass = dashboardSelectClass;

const surfaceClass =
  "rounded-[1.35rem] border border-white/10 bg-[#11151d]/85 shadow-2xl shadow-black/15 ring-1 ring-white/[.025] backdrop-blur";

const toneMap = {
  emerald: {
    accent: "from-emerald-400/80 via-emerald-300/40",
    icon: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/20",
  },
  blue: {
    accent: "from-sky-400/80 via-blue-300/40",
    icon: "bg-sky-400/10 text-sky-200 ring-sky-400/20",
  },
  violet: {
    accent: "from-violet-400/80 via-fuchsia-300/40",
    icon: "bg-violet-400/10 text-violet-200 ring-violet-400/20",
  },
  amber: {
    accent: "from-amber-300/80 via-orange-300/40",
    icon: "bg-amber-400/10 text-amber-200 ring-amber-400/20",
  },
  rose: {
    accent: "from-rose-400/80 via-red-300/40",
    icon: "bg-rose-400/10 text-rose-200 ring-rose-400/20",
  },
};

export function DashboardShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}) {
  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#090d13] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,.16),transparent_32%),radial-gradient(circle_at_90%_8%,rgba(59,130,246,.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,.035),transparent_22rem)]" />
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-300/90">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-3 text-balance text-3xl font-black tracking-[-.045em] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function DashboardLoading({ label = "Đang tải dữ liệu..." }) {
  return (
    <section
      className="min-h-[calc(100vh-72px)] bg-[#090d13] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <div className="h-3 w-32 animate-pulse rounded-full bg-emerald-400/15" />
          <div className="mt-5 h-10 w-3/4 animate-pulse rounded-2xl bg-white/[.07]" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/[.045]" />
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[1.35rem] border border-white/10 bg-white/[.035]"
            />
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="h-96 animate-pulse rounded-[1.35rem] border border-white/10 bg-white/[.035]" />
          <div className="h-96 animate-pulse rounded-[1.35rem] border border-white/10 bg-white/[.035]" />
        </div>
        <p className="mt-6 text-sm text-zinc-500">{label}</p>
      </div>
    </section>
  );
}

export function Card({
  as: Component = "section",
  className = "",
  children,
  ...props
}) {
  return (
    <Component className={cx("relative", surfaceClass, className)} {...props}>
      {children}
    </Component>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className = "",
}) {
  return (
    <div
      className={cx(
        "mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-300/75">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-xl font-bold tracking-[-.025em] text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {(meta || actions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {meta && <Badge>{meta}</Badge>}
          {actions}
        </div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  helper,
  icon = "✦",
  tone = "emerald",
}) {
  const toneClasses = toneMap[tone] || toneMap.emerald;
  return (
    <Card className="overflow-hidden p-5">
      <div
        className={cx(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
          toneClasses.accent,
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-zinc-500">
            {label}
          </p>
          <strong className="mt-3 block truncate text-3xl font-black tracking-[-.04em] text-white">
            {value}
          </strong>
          {helper && (
            <span className="mt-1 block text-xs leading-5 text-zinc-500">
              {helper}
            </span>
          )}
        </div>
        <span
          className={cx(
            "grid size-11 shrink-0 place-items-center rounded-2xl text-lg ring-1",
            toneClasses.icon,
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}

export function Badge({ children, tone = "neutral", className = "" }) {
  const tones = {
    neutral: "border-white/10 bg-white/[.055] text-zinc-300",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    danger: "border-red-400/20 bg-red-400/10 text-red-200",
    info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  };
  return (
    <span
      className={cx(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold leading-none",
        tones[tone] || tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = "md", rounded = "rounded-2xl" }) {
  const sizes = {
    sm: "size-9 text-xs",
    md: "size-11 text-sm",
    lg: "size-20 text-2xl",
  };

  if (src) {
    return (
      <img
        className={cx(
          sizes[size],
          rounded,
          "shrink-0 object-cover ring-1 ring-white/10",
        )}
        src={src}
        alt=""
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={cx(
        sizes[size],
        rounded,
        "grid shrink-0 place-items-center bg-emerald-400/10 font-black text-emerald-200 ring-1 ring-emerald-400/20",
      )}
      aria-hidden="true"
    >
      {name?.[0]?.toUpperCase() || "N"}
    </span>
  );
}

export function EmptyPanel({ title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[.025] px-6 py-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/[.055] text-xl text-zinc-400">
        ◇
      </span>
      <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SoftLinkButton({ to, children, className = "" }) {
  return (
    <Link
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[.055] px-4 text-sm font-bold text-zinc-100 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
        className,
      )}
      to={to}
    >
      {children}
    </Link>
  );
}

export function FieldLabel({ label, children, hint }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-zinc-200">{label}</span>
      {children}
      {hint && <small className="text-xs leading-5 text-zinc-500">{hint}</small>}
    </label>
  );
}

export function ListItem({
  children,
  selected = false,
  className = "",
  as: Component = "div",
  ...props
}) {
  return (
    <Component
      className={cx(
        "rounded-2xl border p-4 transition duration-200",
        selected
          ? "border-emerald-400/40 bg-emerald-400/10 shadow-lg shadow-emerald-950/10"
          : "border-white/10 bg-white/[.03] hover:border-white/15 hover:bg-white/[.055]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function DataTable({ columns, children, minWidth = 760 }) {
  const template = columns.map((column) => column.width || "1fr").join(" ");
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth }} className="w-full">
        <div
          className="grid gap-4 border-b border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[.16em] text-zinc-500"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((column) => (
            <span key={column.key}>{column.label}</span>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export function DataTableRow({ columns, children }) {
  const template = columns.map((column) => column.width || "1fr").join(" ");
  return (
    <div
      className="grid items-center gap-4 border-b border-white/5 px-6 py-4 transition duration-200 hover:bg-white/[.035]"
      style={{ gridTemplateColumns: template }}
    >
      {children}
    </div>
  );
}

export function IconButton({
  label,
  children,
  tone = "neutral",
  className = "",
  ...props
}) {
  const tones = {
    neutral:
      "border-white/10 bg-white/[.045] text-zinc-300 hover:border-white/20 hover:bg-white/[.08] hover:text-white",
    danger:
      "border-red-400/20 bg-red-400/10 text-red-200 hover:border-red-400/30 hover:bg-red-400/20",
  };
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(
        "grid size-10 shrink-0 place-items-center rounded-xl border transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50",
        tones[tone] || tones.neutral,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
