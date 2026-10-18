import { useI18n } from "../../context/I18nContext";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useMemo, useState } from "react";
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
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

import { useNotifications } from "../../context/NotificationsContext";

const TABS = ["All", "Unread", "Read"];

// One icon + color tone per NotificationType in the data model.
const TYPE_META = {
  reservation_created: { icon: CalendarCheck, tone: "blue", label: "New reservation" },
  reservation_confirmed: { icon: CalendarCheck, tone: "green", label: "Reservation confirmed" },
  reservation_cancelled: { icon: CalendarX, tone: "red", label: "Reservation cancelled" },
  pickup_reminder: { icon: Clock, tone: "blue", label: "Pickup reminder" },
  return_reminder: { icon: RotateCcw, tone: "amber", label: "Return reminder" },
  payment_received: { icon: CreditCard, tone: "green", label: "Payment received" },
  review_request: { icon: Star, tone: "purple", label: "Review request" },
};

function timeAgo(iso, lang) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const formatter = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (seconds < 60) return formatter.format(0, "second");
  if (seconds < 3600) return formatter.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return formatter.format(-Math.floor(seconds / 3600), "hour");
  return formatter.format(-Math.floor(seconds / 86400), "day");
}

export default function AdminNotifications() {
  const { t, lang } = useI18n();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { notifications, setNotifications, refreshNotifications } = useNotifications();
  const [tab, setTab] = useState("All");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const pagination = usePagination(filtered, JSON.stringify([tab, typeFilter]));

  const handleMarkRead = async (id) => {
    const updated = await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const handleMarkAllRead = async () => {
    if (!(await confirm("Are you sure you want to mark all notifications as read?", { confirmLabel: "Mark all read" }))) return;
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await refreshNotifications();
  };

  const handleDelete = async (id) => {
    if (!(await confirm("Are you sure you want to delete this notification?", { danger: true, confirmLabel: "Delete" }))) return;
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenRelated = async (n) => {
    if (!n.is_read) await handleMarkRead(n.id);
    if (n.related_type?.toLowerCase() === "reservation") navigate("/admin/reservations");
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t("Notifications")}</h1>
        <div className="page-header-actions">
          <button
            className="btn"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            {t("Mark all as read")}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Total")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{notifications.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Unread")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{unreadCount}</span>
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {TABS.map((tabLabel) => (
          <button
            key={tabLabel}
            className={`pill-tab ${tab === tabLabel ? "active" : ""}`}
            onClick={() => setTab(tabLabel)}
          >
            {t(tabLabel)}
            {tabLabel === "Unread" && unreadCount > 0 && (
              <span className="tab-badge">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {tab === "All" ? t("All notifications") : t("{value0} notifications", { value0: t(tab) })}
          <span className="count-pill">{filtered.length}</span>

          <select
            className="filter-select"
            style={{ marginInlineStart: "auto" }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">{t("All types")}</option>
            {Object.entries(TYPE_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {t(meta.label)}
              </option>
            ))}
          </select>
        </div>

        <div className="notification-list">
          {pagination.pageItems.map((n) => {
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
                    {!n.is_read && <span className="unread-dot" title={t("Unread")} />}
                  </div>
                  <p className="notification-message">{n.message}</p>
                  <div className="notification-meta">
                    <span>{timeAgo(n.created_at, lang)}</span>
                    <span className="meta-sep">•</span>
                    <span>{t(meta.label)}</span>
                    {n.related_type && (
                      <>
                        <span className="meta-sep">•</span>
                        <button
                          className="notification-link"
                          onClick={() => handleOpenRelated(n)}
                        >
                          {t("View {type}", { type: t(n.related_type).toLowerCase() })}
                          <ArrowUpRight size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="row-actions">
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} title={t("Mark as read")}>
                      <Check size={15} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} title={t("Delete")} className="danger">
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
                  ? t("You're all caught up — no unread notifications.")
                  : t("No notifications to show.")}
              </p>
            </div>
          )}
        </div>
        <Pagination {...pagination} />
      </div>
    </div>
  );
}