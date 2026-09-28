import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CalendarX,
  Clock,
  RotateCcw,
  CreditCard,
  Star,
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/adminApi";

const TABS = ["All", "Unread", "Read"];

// One icon + color tone per NotificationType in the data model.
const TYPE_META = {
  reservation_confirmed: { icon: CalendarCheck, tone: "green", label: "Reservation confirmed" },
  reservation_cancelled: { icon: CalendarX, tone: "red", label: "Reservation cancelled" },
  pickup_reminder: { icon: Clock, tone: "blue", label: "Pickup reminder" },
  return_reminder: { icon: RotateCcw, tone: "amber", label: "Return reminder" },
  payment_received: { icon: CreditCard, tone: "green", label: "Payment received" },
  review_request: { icon: Star, tone: "purple", label: "Review request" },
};

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = useMemo(() => {
    return notifications
      .filter((n) => {
        if (tab === "Unread") return !n.is_read;
        if (tab === "Read") return n.is_read;
        return true;
      })
      .filter((n) => typeFilter === "all" || n.type === typeFilter);
  }, [notifications, tab, typeFilter]);

  const handleMarkRead = async (id) => {
    const updated = await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const handleMarkAllRead = async () => {
    if (!confirm("Are you sure you want to mark all notifications as read?")) return;
    setNotifications(await markAllNotificationsAsRead());
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenRelated = async (n) => {
    if (!n.is_read) await handleMarkRead(n.id);
    if (n.related_type === "Reservation") navigate("/admin/reservations");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <div className="page-header-actions">
          <button
            className="btn"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{notifications.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Unread</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{unreadCount}</span>
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`pill-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "Unread" && unreadCount > 0 && (
              <span className="tab-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {tab === "All" ? "All notifications" : `${tab} notifications`}
          <span className="count-pill">{filtered.length}</span>

          <select
            className="filter-select"
            style={{ marginLeft: "auto" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            {Object.entries(TYPE_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        <div className="notification-list">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] || { icon: Bell, tone: "gray", label: n.type };
            const Icon = meta.icon;

            return (
              <div key={n.id} className={`notification-item ${n.is_read ? "" : "unread"}`}>
                <div className={`notification-icon tone-${meta.tone}`}>
                  <Icon size={18} />
                </div>

                <div className="notification-content">
                  <div className="notification-top">
                    <span className="notification-title">{n.title}</span>
                    {!n.is_read && <span className="unread-dot" title="Unread" />}
                  </div>
                  <p className="notification-message">{n.message}</p>
                  <div className="notification-meta">
                    <span>{timeAgo(n.created_at)}</span>
                    <span className="meta-sep">•</span>
                    <span>{meta.label}</span>
                    {n.related_type && (
                      <>
                        <span className="meta-sep">•</span>
                        <button
                          className="notification-link"
                          onClick={() => handleOpenRelated(n)}
                        >
                          View {n.related_type.toLowerCase()}
                          <ArrowUpRight size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="row-actions">
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} title="Mark as read">
                      <Check size={15} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} title="Delete" className="danger">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="notification-empty">
              <Bell size={28} />
              <p>
                {tab === "Unread"
                  ? "You're all caught up — no unread notifications."
                  : "No notifications to show."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}