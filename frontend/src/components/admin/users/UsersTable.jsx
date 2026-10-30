import { useI18n } from "../../../context/I18nContext";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Pagination from "../../Pagination.jsx";
import { initials, capitalize } from "./userDisplay.js";

export default function UsersTable({
  tab,
  filtered,
  query,
  setQuery,
  pagination,
  reservationsByUser,
  setViewing,
  openEdit,
  handleDelete,
  deleting,
}) {
  const { t } = useI18n();
  return (
    <div className="table-card">
      <div className="table-card-header">
        {tab === "All"
          ? t("All Users")
          : t("{value0} Users", { value0: t(tab) })}
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
            const userReservations = reservationsByUser.get(u.id) || [];
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
                      {userReservations.length === 1
                        ? t("booking")
                        : t("bookings")}
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
                    <button
                      onClick={() => openEdit(u)}
                      title={t("Edit User")}
                      aria-label={t("Edit User")}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="danger"
                      onClick={() => handleDelete(u)}
                      title={t("Delete User")}
                      aria-label={t("Delete User")}
                      disabled={deleting !== null}
                    >
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
  );
}
