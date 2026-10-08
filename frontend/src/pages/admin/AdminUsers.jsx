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

  const activeCount = users.filter((u) => u.isActive).length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const viewingReservations = viewing
    ? reservationsByEmail[viewing.email.toLowerCase()] || []
    : [];

  return (
    <div>
      <div className="page-header">
        <h1>Users & Roles</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total users</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{users.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{activeCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Staff</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{staffCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Admins</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{adminCount}</span>
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {ROLE_TABS.map((t) => (
          <button
            key={t}
            className={`pill-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {tab === "All" ? "All Users" : `${tab} Users`}
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box users-search">
            <input
              placeholder="Search by email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Status</th>
              <th>Role</th>
              <th>Reservations</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => {
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
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <span className={`badge badge-role-${u.role}`}>
                      {capitalize(u.role)}
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
                        {userReservations.length === 1 ? "booking" : "bookings"}
                      </span>
                    </span>
                  </td>

                  <td className="td-actions">
                    <div className="row-actions">
                      <button
                        onClick={() => setViewing(u)}
                        title={
                          userReservations.length === 0
                            ? "No reservations to review"
                            : "Review reservations"
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
                  No users match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                    {capitalize(viewing.role)}
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
                    <th>Reference</th>
                    <th>Vehicle</th>
                    <th>Pickup → Return</th>
                    <th>Status</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingReservations.map((r) => (
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
                          {r.status}
                        </span>
                      </td>
                      <td>{r.total_price} MAD</td>
                    </tr>
                  ))}

                  {viewingReservations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No reservations for this user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setViewing(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}