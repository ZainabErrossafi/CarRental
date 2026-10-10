import { useI18n } from "../../context/I18nContext";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useMemo, useState } from "react";
import { Eye, X } from "lucide-react";
import { getUsers, getReservations } from "../../services/adminApi";

const ROLE_TABS = ["All", "Client", "Staff", "Admin"];

function initials(email) {
  return email.charAt(0).toUpperCase();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    getUsers().then(setUsers);
    getReservations().then(setReservations);
  }, []);

  // Reservations grouped by the driver's email, so each client row can show
  // how many bookings belong to them (mirrors reservation.email on the model).
  const reservationsByEmail = useMemo(() => {
    const map = {};
    reservations.forEach((r) => {
      const key = r.email.toLowerCase();
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [reservations]);

  const filtered = useMemo(() => {
    return users
      .filter((u) => tab === "All" || u.role === tab.toLowerCase())
      .filter((u) => u.email.toLowerCase().includes(query.toLowerCase()));
  }, [users, tab, query]);

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  const activeCount = users.filter((u) => u.isActive).length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const viewingReservations = viewing
    ? reservationsByEmail[viewing.email.toLowerCase()] || []
    : [];

  const reservationPagination = usePagination(viewingReservations, viewing?.id ?? viewing?.email ?? "");

  return (
    <div>
      <div className="page-header">
        <h1>{t("Users & Roles")}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Total users")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{users.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Active")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Staff")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{staffCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Admins")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{adminCount}</span>
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {ROLE_TABS.map((tabLabel) => (
          <button
            key={tabLabel}
            className={`pill-tab ${tab === tabLabel ? "active" : ""}`}
            onClick={() => setTab(tabLabel)}
          >
            {t(tabLabel)}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {tab === "All" ? t("All Users") : t("{value0} Users", { value0: t(tab) })}
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box users-search">
            <input
              placeholder={t("Search by email")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>{t("User")}</th>
              <th>{t("Status")}</th>
              <th>{t("Role")}</th>
              <th>{t("Reservations")}</th>
              <th className="th-actions">{t("Actions")}</th>
            </tr>
          </thead>

          <tbody>
            {pagination.pageItems.map((u) => {
              const userReservations =
                reservationsByEmail[u.email.toLowerCase()] || [];
              const name = u.email.split("@")[0];

              return (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{initials(u.email)}</div>
                      <div className="user-cell-text">
                        <span className="user-name">{name}</span>
                        <span className="user-email">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status-pill ${
                        u.isActive ? "is-active" : "is-inactive"
                      }`}
                    >
                      <span className="status-pill-dot" />
                      {u.isActive ? t("Active") : t("Inactive")}
                    </span>
                  </td>

                  <td>
                    <span className={`badge badge-role-${u.role}`}>
                      {t(capitalize(u.role))}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`res-count ${
                        userReservations.length === 0 ? "is-zero" : ""
                      }`}
                    >
                      {userReservations.length}
                      <span className="res-count-label">
                        {userReservations.length === 1 ? t("booking") : t("bookings")}
                      </span>
                    </span>
                  </td>

                  <td className="td-actions">
                    <div className="row-actions">
                      <button
                        onClick={() => setViewing(u)}
                        title={
                          userReservations.length === 0
                            ? t("No reservations to review")
                            : t("Review reservations")
                        }
                        disabled={userReservations.length === 0}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="table-empty">
                  {t("No users match this filter.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>

      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div
            className="modal-card modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="user-cell">
                <div className="user-avatar">{initials(viewing.email)}</div>
                <div className="user-cell-text">
                  <h3>{viewing.email}</h3>
                  <span className={`badge badge-role-${viewing.role}`}>
                    {t(capitalize(viewing.role))}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewing(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 0 }}>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>{t("Reference")}</th>
                    <th>{t("Vehicle")}</th>
                    <th>{t("Pickup → Return")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Total Price")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationPagination.pageItems.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.reference}</strong>
                      </td>
                      <td>{r.vehicle}</td>
                      <td>
                        {r.pickup_date} → {r.return_date}
                      </td>
                      <td>
                        <span className="status-dot-label">
                          <span className={`dot dot-${r.status}`} />
                          {t(r.status)}
                        </span>
                      </td>
                      <td>{r.total_price} {t("MAD")}</td>
                    </tr>
                  ))}

                  {viewingReservations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        {t("No reservations for this user.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination {...reservationPagination} />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setViewing(null)}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}