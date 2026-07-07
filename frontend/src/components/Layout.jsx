import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  CloseIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from "./Icons.jsx";

function BrandMark() {
  return (
    <span
      className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-sm font-black text-white shadow-sm dark:bg-white dark:text-zinc-950"
      aria-hidden="true"
    >
      N
    </span>
  );
}

function Avatar({ user, compact = false }) {
  return user.avatar ? (
    <img
      className={`${compact ? "size-8" : "size-10"} rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700`}
      src={user.avatar}
      alt=""
      referrerPolicy="no-referrer"
    />
  ) : (
    <span
      className={`${compact ? "size-8 text-xs" : "size-10 text-sm"} grid place-items-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`}
      aria-hidden="true"
    >
      {user.username?.[0]?.toUpperCase()}
    </span>
  );
}

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = useMemo(() => {
    const items = [{ to: "/", label: "Khóa học", end: true }];
    if (user) items.push({ to: "/profile", label: "Học tập" });
    if (user?.role === "teacher" || user?.role === "admin") {
      items.push({ to: "/teacher", label: "Giảng dạy" });
    }
    if (user?.role === "admin") {
      items.push({ to: "/admin", label: "Quản trị" });
    }
    return items;
  }, [user]);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  }

  function NavigationLinks({ mobile = false }) {
    return (
      <nav
        className={mobile ? "grid gap-1" : "hidden items-center gap-1 md:flex"}
        aria-label="Điều hướng chính"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${mobile ? "rounded-xl px-4 py-3 text-base" : "relative rounded-lg px-3 py-2 text-sm"} font-semibold transition ${
                isActive
                  ? mobile
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
                    : "text-emerald-700 dark:text-emerald-300"
                  : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.label}
                {!mobile && isActive && (
                  <span
                    className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,.55)]"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <a
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
        href="#main-content"
      >
        Bỏ qua điều hướng
      </a>

      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <NavLink
            to="/"
            className="inline-flex shrink-0 items-center gap-3 text-sm font-black tracking-[-.02em]"
            aria-label="Northstar — Trang chủ"
          >
            <BrandMark />
            <span className="hidden sm:inline">Northstar</span>
          </NavLink>

          <NavigationLinks />

          <div className="flex items-center gap-2">
            <button
              className="grid size-10 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              type="button"
              onClick={toggleTheme}
              title="Đổi giao diện"
              aria-label={
                theme === "dark"
                  ? "Chuyển sang giao diện sáng"
                  : "Chuyển sang giao diện tối"
              }
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {!loading && !user && (
              <div className="hidden items-center gap-2 sm:flex">
                <NavLink
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                  to="/login"
                >
                  Đăng nhập
                </NavLink>
                <NavLink
                  className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
                  to="/register"
                >
                  Bắt đầu học
                </NavLink>
              </div>
            )}

            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <NavLink
                  to="/profile"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={`Hồ sơ của ${user.username}`}
                >
                  <Avatar user={user} compact />
                  <span className="hidden text-left lg:block">
                    <strong className="block max-w-28 truncate text-xs">
                      {user.username}
                    </strong>
                    <small className="block text-[10px] capitalize text-zinc-500">
                      {user.role}
                    </small>
                  </span>
                </NavLink>
                <button
                  className="grid size-10 place-items-center rounded-xl text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOutIcon />
                </button>
              </div>
            )}

            <button
              aria-controls="mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              className="grid size-10 place-items-center rounded-xl text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              type="button"
            >
              {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            className="absolute inset-0 bg-zinc-950/45 backdrop-blur-sm"
            aria-label="Đóng menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="absolute right-0 top-[72px] h-[calc(100%-72px)] w-[min(88vw,380px)] animate-fade-up border-l border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            id="mobile-navigation"
            aria-label="Menu di động"
          >
            {user && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
                <Avatar user={user} />
                <div className="min-w-0">
                  <strong className="block truncate text-sm">{user.username}</strong>
                  <small className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email || user.role}
                  </small>
                </div>
              </div>
            )}
            <NavigationLinks mobile />
            <div className="mt-6 grid gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              {!user && !loading && (
                <>
                  <NavLink
                    className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 font-semibold dark:border-zinc-700"
                    to="/login"
                  >
                    Đăng nhập
                  </NavLink>
                  <NavLink
                    className="flex min-h-11 items-center justify-center rounded-xl bg-brand-600 font-semibold text-white"
                    to="/register"
                  >
                    Bắt đầu học
                  </NavLink>
                </>
              )}
              {user && (
                <button
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 font-semibold text-red-600 dark:border-red-900 dark:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOutIcon /> Đăng xuất
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      <main id="main-content" tabIndex="-1">
        <div key={location.pathname} className="animate-fade-up">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <strong className="block text-sm">Northstar Learning</strong>
              <small className="text-xs text-zinc-500">
                Học sâu. Làm thật. Đi xa.
              </small>
            </div>
          </div>
          <span className="text-xs text-zinc-500">© 2026 Northstar Learning</span>
        </div>
      </footer>
    </div>
  );
}
