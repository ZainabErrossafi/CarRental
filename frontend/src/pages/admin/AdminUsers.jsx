import { useI18n } from "../../context/I18nContext";
import { formatReservationDate } from "../../services/reservationInvoice";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useMemo, useState } from "react";
import { Eye, Plus, Trash2, X } from "lucide-react";
import { getUsers, getReservations, createUser, deleteUser } from "../../services/adminApi";

import { useConfirm } from "../../context/Confirmcontext";

const EMPTY_USER = { username: "", email: "", password: "", first_name: "", last_name: "", phone: "", role: "client", is_active: true };

const ROLE_TABS = ["All", "Client", "Staff", "Admin"];

function initials(email) {
  return email.charAt(0).toUpperCase();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AdminUsers() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState(null);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (user) => {
    if (deleting !== null) return;
    if (!(await confirm(t('Delete user "{email}"? This cannot be undone. Reservation history will be kept.', { email: user.email }), { danger: true, confirmLabel: "Delete" }))) return;
    setDeleting(user.id);
    setDeleteError("");
    try {
      await deleteUser(user.id);
      setUsers((previous) => previous.filter((item) => item.id !== user.id));
    } catch (err) {
      setDeleteError(err.message || t("Could not delete user. Please try again."));
    } finally {
      setDeleting(null);
    }
  };

  const closeCreate = () => {
    if (!saving) setCreating(false);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const user = await createUser({
        ...form,
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
      });
      setUsers((previous) => [user, ...previous]);
      setTab("All");
      setQuery("");
      setCreating(false);
      setForm(EMPTY_USER);
    } catch (err) {
      setError(err.message || t("Could not create user. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getUsers().then(setUsers);
    getReservations().then(setReservations);
  }, []);

  // Prefer the linked account; guest bookings fall back to a normalized email.
  const reservationsByUser = useMemo(() => {
    const map = new Map();
    users.forEach((user) => {
      const email = (user.email || "").trim().toLowerCase();
      map.set(user.id, reservations.filter((reservation) =>
        reservation.user != null
          ? String(reservation.user) === String(user.id)
          : email !== "" && (reservation.email || "").trim().toLowerCase() === email
      ));
    });
    return map;
  }, [users, reservations]);

  const filtered = useMemo(() => {
    return users
      .filter((u) => tab === "All" || u.role === tab.toLowerCase())
      .filter((u) => u.email.toLowerCase().includes(query.toLowerCase()));
  }, [users, tab, query]);

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  const activeCount = users.filter((u) => u.is_active).length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const viewingReservations = viewing
    ? reservationsByUser.get(viewing.id) || []
    : [];

  const reservationPagination = usePagination(viewingReservations, viewing?.id ?? viewing?.email ?? "");

  return (
    <div>
      <div className="page-header">
        <h1>{t("Users & Roles")}</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={() => { setForm(EMPTY_USER); setError(""); setCreating(true); }}>
            <Plus size={16} strokeWidth={2.5} />
            {t("Create User")}
          </button>
        </div>
      </div>

      {deleteError && <p role="alert" style={{ color: "var(--danger, #b42318)" }}>{deleteError}</p>}

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
                reservationsByUser.get(u.id) || [];
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
                        u.is_active ? "is-active" : "is-inactive"
                      }`}
                    >
                      <span className="status-pill-dot" />
                      {u.is_active ? t("Active") : t("Inactive")}
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
                        title={t("Review reservations")}
                        aria-label={t("Review reservations")}
                      >
                        <Eye size={15} />
                      </button>
                      <button className="danger" onClick={() => handleDelete(u)} title={t("Delete User")} aria-label={t("Delete User")} disabled={deleting !== null}>
                        <Trash2 size={15} />
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

      {creating && (
        <div className="modal-overlay" onClick={closeCreate} onKeyDown={(event) => { if (event.key === "Escape") closeCreate(); }}>
          <div className="modal-card modal-wide catalog-dialog" role="dialog" aria-modal="true" aria-labelledby="create-user-title" onClick={(event) => event.stopPropagation()}>
            <form onSubmit={handleCreate}>
              <div className="modal-header">
                <h3 id="create-user-title">{t("Create User")}</h3>
                <button type="button" className="modal-close" onClick={closeCreate} disabled={saving} aria-label={t("Close")}><X size={18} /></button>
              </div>
              <div className="modal-body catalog-dialog-body">
                {error && <p role="alert" style={{ color: "var(--danger, #b42318)", whiteSpace: "pre-line" }}>{error}</p>}
                {[
                  ["username", "Username", "text", true, 150],
                  ["email", "Email", "email", true, 254],
                  ["password", "Password", "password", true, undefined],
                  ["first_name", "First name", "text", false, 150],
                  ["last_name", "Last name", "text", false, 150],
                  ["phone", "Phone", "tel", false, 20],
                ].map(([name, label, type, required, maxLength]) => (
                  <div className="form-field" key={name}>
                    <label className="catalog-field-label" htmlFor={`user-${name}`}>{t(label)}</label>
                    <input id={`user-${name}`} type={type} value={form[name]} required={required} maxLength={maxLength} disabled={saving} autoFocus={name === "username"} autoComplete={name === "password" ? "new-password" : name === "username" ? "off" : undefined} onChange={(event) => setForm((previous) => ({ ...previous, [name]: event.target.value }))} />
                  </div>
                ))}
                <div className="form-field">
                  <label className="catalog-field-label" htmlFor="user-role">{t("Role")}</label>
                  <select id="user-role" value={form.role} disabled={saving} onChange={(event) => setForm((previous) => ({ ...previous, role: event.target.value }))}>
                    <option value="client">{t("Client")}</option>
                    <option value="admin">{t("Admin")}</option>
                  </select>
                </div>
                <label className="vehicle-featured-control">
                  <span className="vehicle-featured-title">{t("Active")}</span>
                  <input className="vehicle-featured-input" type="checkbox" role="switch" checked={form.is_active} disabled={saving} onChange={(event) => setForm((previous) => ({ ...previous, is_active: event.target.checked }))} />
                  <span className="vehicle-featured-switch" aria-hidden="true" />
                </label>
              </div>
              <div className="modal-footer" style={{ gap: "0.6rem" }}>
                <button type="button" className="btn btn-secondary" onClick={closeCreate} disabled={saving}>{t("Cancel")}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t("Saving...") : t("Create User")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <td>{r.vehicle_name || r.vehicle}</td>
                      <td>
                        {formatReservationDate(r.pickup_date)} → {formatReservationDate(r.return_date)}
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