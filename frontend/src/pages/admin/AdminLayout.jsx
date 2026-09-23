import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  MapPin,
  Tag,
  CalendarCheck,
  Star,
  Users,
  Settings,
  HelpCircle,
  Bell,
  BarChart2,
  Search,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
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
      { to: "/admin/reviews", label: "Reviews", icon: Star },
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
  {
    label: "Insights",
    items: [{ to: "/admin/analytics", label: "Analytics", icon: BarChart2 }],
  },
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="logo-dot" />
          Rently Admin
        </div>

        <div className="sidebar-search">
          <Search size={15} />
          Search
          <kbd>⌘K</kbd>
        </div>

        <nav>
          {NAV_SECTIONS.map((section) => (
            <div className="nav-section" key={section.label}>
              <span className="nav-section-label">{section.label}</span>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} end={item.end}>
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="avatar" />
          <div>
            <div style={{ fontWeight: 600 }}>Admin User</div>
            <div style={{ color: "#98a2b3", fontSize: "0.78rem" }}>admin@Rently.com</div>
          </div>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}