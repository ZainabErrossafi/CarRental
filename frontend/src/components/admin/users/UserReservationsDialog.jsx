import { useI18n } from "../../../context/I18nContext";
import { X } from "lucide-react";
import Pagination from "../../Pagination.jsx";
import { formatReservationDate } from "../../../services/reservationInvoice";
import { initials, capitalize } from "./userDisplay.js";

export default function UserReservationsDialog({
  viewing,
  setViewing,
  viewingReservations,
  reservationPagination,
}) {
  const { t } = useI18n();
  return (
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
                    {formatReservationDate(r.pickup_date)} →{" "}
                    {formatReservationDate(r.return_date)}
                  </td>
                  <td>
                    <span className="status-dot-label">
                      <span className={`dot dot-${r.status}`} />
                      {t(r.status)}
                    </span>
                  </td>
                  <td>
                    {r.total_price} {t("MAD")}
                  </td>
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
  );
}
