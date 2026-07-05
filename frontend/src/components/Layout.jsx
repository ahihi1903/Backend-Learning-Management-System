import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { ArrowRightIcon, CloseIcon, LogOutIcon, MenuIcon, MoonIcon, SunIcon } from "./Icons.jsx";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span>N</span>
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
    if (user?.role === "admin") items.push({ to: "/admin", label: "Quản trị" });
    return items;
  }, [user]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }
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

  function NavigationLinks({ className = "" }) {
    return (
      <nav className={className} aria-label="Điều hướng chính">
        {navigation.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand" aria-label="Northstar — Trang chủ">
            <BrandMark />
            <span>Northstar</span>
          </NavLink>

          <NavigationLinks className="main-nav" />

          <div className="account-actions">
            <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} title="Đổi giao diện" aria-label={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}>
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            {!loading && !user && (
              <>
                <NavLink className="text-button" to="/login">
                  Đăng nhập
                </NavLink>
                <NavLink className="button button-small" to="/register">
                  Bắt đầu học
                </NavLink>
              </>
            )}
            {user && (
              <>
                <NavLink to="/profile" className="user-chip" aria-label={`Hồ sơ của ${user.username}`}>
                  <span className="avatar" aria-hidden="true">{user.username?.[0]?.toUpperCase()}</span>
                  <span className="user-chip-copy">
                    <strong>{user.username}</strong>
                    <small>{user.role}</small>
                  </span>
                </NavLink>
                <button className="icon-button desktop-logout" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất">
                  <LogOutIcon />
                </button>
              </>
            )}
            <button
              aria-controls="mobile-navigation"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              className="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen((open) => !open)}
              type="button"
            >
              {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-navigation-shell ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <button className="mobile-navigation-backdrop" aria-label="Đóng menu" onClick={() => setMobileMenuOpen(false)} tabIndex={mobileMenuOpen ? 0 : -1} />
        <aside className="mobile-navigation" id="mobile-navigation" aria-label="Menu di động">
          {user && (
            <div className="mobile-user-summary">
              <span className="avatar" aria-hidden="true">{user.username?.[0]?.toUpperCase()}</span>
              <div>
                <strong>{user.username}</strong>
                <small>{user.email || user.role}</small>
              </div>
            </div>
          )}
          <NavigationLinks className="mobile-nav-links" />
          <div className="mobile-nav-actions">
            <button className="mobile-theme-row" type="button" onClick={toggleTheme}>
              <span>{theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}</span>
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            {!user && !loading && (
              <>
                <NavLink className="button button-secondary button-wide" to="/login">Đăng nhập</NavLink>
                <NavLink className="button button-wide" to="/register">Bắt đầu học <ArrowRightIcon /></NavLink>
              </>
            )}
            {user && (
              <button className="button button-secondary button-wide" onClick={handleLogout}>
                <LogOutIcon /> Đăng xuất
              </button>
            )}
          </div>
        </aside>
      </div>

      <main id="main-content" tabIndex="-1">
        <div className="page-transition" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <BrandMark />
            <div><strong>Northstar Learning</strong><small>Học sâu. Làm thật. Đi xa.</small></div>
          </div>
          <div className="footer-meta">
            <nav className="footer-nav" aria-label="Điều hướng cuối trang">
              <NavLink to="/">Khóa học</NavLink>
              {user && <NavLink to="/profile">Học tập</NavLink>}
            </nav>
            <span>© 2026 Northstar Learning</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
