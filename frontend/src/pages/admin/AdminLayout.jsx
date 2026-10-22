import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  MapPin,
  Tag,
  CalendarCheck,
  Users,
  Settings,
  HelpCircle,
  Bell,
  BarChart2,
  Search,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import GlobalSearch from "../../components/GlobalSearch.jsx";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";

import { NotificationsProvider, useNotifications } from "../../context/NotificationsContext";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/reports", label: "Reports & Data", icon: BarChart2 }],
  },
  {
    label: "Fleet",
    items: [
      { to: "/admin/vehicles", label: "Vehicles", icon: Car },
      { to: "/admin/locations", label: "Locations", icon: MapPin },
      { to: "/admin/catalog", label: "Catalog", icon: Tag },
    ],
  },
  {
    label: "Bookings",
    items: [
      { to: "/admin/reservations", label: "Reservations", icon: CalendarCheck },
    ],
  },
  {
    label: "Users",
    items: [{ to: "/admin/users", label: "Users & Roles", icon: Users }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/site-settings", label: "Site Settings", icon: Settings },
      { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

const ALL_PAGES = NAV_SECTIONS.flatMap((s) => s.items);

export default function AdminLayout() {
  return <NotificationsProvider><AdminLayoutContent /></NotificationsProvider>;
}

function AdminLayoutContent() {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((item) => !item.is_read).length;
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K opens the global search from anywhere
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the mobile drawer whenever the user navigates
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label={t("Open menu")}
          aria-expanded={sidebarOpen}
        >
          <Menu size={18} />
        </button>
        <span className="topbar-title">{t("Rently Admin")}</span>
        <button type="button" onClick={() => setSearchOpen(true)} aria-label={t("Search")}>
          <Search size={18} />
        </button>
        <LanguageSwitcher />
      </header>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <Link to="/" className="sidebar-brand" aria-label={t("Back to home")}>
          <span className="logo-dot" />
          {t("Rently Admin")}
        </Link>

        <button
          type="button"
          className="sidebar-search"
          onClick={() => setSearchOpen(true)}
          aria-label={t("Search")}
        >
          <Search size={15} />
          {t("Search")}
          <kbd>{t("⌘K")}</kbd>
        </button>

        <nav>
          {NAV_SECTIONS.map((section) => (
            <div className="nav-section" key={section.label}>
              <span className="nav-section-label">{t(section.label)}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end}>
                    <Icon size={16} />
                    {t(item.label)}
                    {item.to === "/admin/notifications" && unreadCount > 0 && (
                      <span className="sidebar-notification-badge" role="status" aria-label={t("{count} unread notifications", { count: unreadCount })}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="avatar" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{user?.name || t("Admin User")}</div>
            <div style={{ color: "#98a2b3", fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={t("Log out")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#897973", display: "flex" }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-header">
          <LanguageSwitcher />
        </div>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} pages={ALL_PAGES} />
    </div>
  );
}