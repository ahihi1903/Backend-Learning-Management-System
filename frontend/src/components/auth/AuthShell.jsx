import { Link } from "react-router-dom";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  highlights = [],
}) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-stretch lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative hidden overflow-hidden bg-zinc-950 px-10 py-16 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.22),transparent_36%),radial-gradient(circle_at_80%_75%,rgba(59,130,246,.16),transparent_34%)]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3 text-sm font-bold">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-lg text-zinc-950">
              N
            </span>
            Northstar Learning
          </Link>
        </div>
        <div className="relative max-w-xl animate-fade-up">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-emerald-300">
            {eyebrow}
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-[-.04em] xl:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-300">
            {description}
          </p>
          {highlights.length > 0 && (
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {highlights.map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur"
                >
                  <span className="text-xs font-bold text-emerald-300">
                    0{index + 1}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-zinc-100">{item}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="relative text-sm text-zinc-500">
          Học sâu. Làm thật. Đi xa.
        </p>
      </div>

      <div className="flex items-center justify-center bg-zinc-50 px-5 py-10 dark:bg-zinc-950 sm:px-8 lg:px-12">
        <div className="w-full max-w-md animate-fade-up rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-2xl shadow-zinc-950/[.06] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30 sm:p-9">
          {children}
          {footer && (
            <p className="mt-7 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {footer}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
