import { useI18n } from "../../../context/I18nContext";
import Pagination from "../pagination/Pagination.jsx";
import { Check, X, CheckCheck, User, Phone, Mail } from "lucide-react";
import { formatReservationDate } from "../../../services/reservationInvoice";
function EyeIcon(props) {
  return (
    <svg
      width={props.size || 16}
      height={props.size || 16}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ReservationsTable({
  tab,
  filtered,
  pagination,
  durationDays,
  setViewing,
  handleConfirm,
  handleCancel,
  handleComplete,
  pendingId,
}) {
  const { t } = useI18n();
  return (
    <div className="table-card">
      <div className="table-card-header">
        {tab === "All"
          ? t("All Reservations")
          : t("{value0} Reservations", { value0: t(tab) })}
        <span className="count-pill">{filtered.length}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>{t("Reference")}</th>
            <th>{t("Vehicle")}</th>
            <th>{t("Driver")}</th>
            <th>{t("Pickup → Return")}</th>
            <th>{t("Duration")}</th>
            <th>{t("Extras")}</th>
            <th>{t("Features")}</th>
            <th>{t("Total Price")}</th>
            <th>{t("Status")}</th>
            <th>{t("Actions")}</th>
          </tr>
        </thead>

        <tbody>
          {pagination.pageItems.map((r) => (
            <tr key={r.id}>
              <td>
                <strong>{r.reference}</strong>
              </td>

              <td>{r.vehicle_name || r.vehicle}</td>

              <td>
                <div className="driver-cell">
                  <div className="driver-name">
                    <User size={13} /> {r.driver_name}
                  </div>
                  <div className="driver-contact">
                    <Phone size={12} /> {r.phone}
                  </div>
                  <div className="driver-contact">
                    <Mail size={12} /> {r.email}
                  </div>
                </div>
              </td>

              <td>
                {formatReservationDate(r.pickup_date)} →{" "}
                {formatReservationDate(r.return_date)}
              </td>

              <td>
                {t(durationDays(r) === 1 ? "{count} day" : "{count} days", {
                  count: durationDays(r),
                })}
              </td>

              <td>
                {r.extra_details?.length
                  ? r.extra_details
                      .map((extra) => `${extra.name} × ${extra.quantity}`)
                      .join(", ")
                  : t("None")}
              </td>

              <td>
                {r.features?.length
                  ? r.features.map((name) => t(name)).join(", ")
                  : t("None")}
              </td>

              <td>
                {r.total_price} {t("MAD")}
              </td>

              <td>
                <span className={`badge badge-${r.status}`}>{t(r.status)}</span>
              </td>

              <td>
                <div className="row-actions">
                  <button
                    onClick={() => setViewing(r)}
                    title={t("View details")}
                  >
                    <EyeIcon size={15} />
                  </button>

                  {r.status === "pending" && (
                    <>
                      <button
                        disabled={pendingId != null}
                        aria-busy={pendingId === r.id}
                        onClick={() => handleConfirm(r.id)}
                        title={t("Confirm")}
                      >
                        <Check size={15} />
                      </button>
                      <button
                        disabled={pendingId != null}
                        aria-busy={pendingId === r.id}
                        onClick={() => handleCancel(r.id)}
                        title={t("Cancel")}
                        className="danger"
                      >
                        <X size={15} />
                      </button>
                    </>
                  )}

                  {r.status === "confirmed" && (
                    <>
                      <button
                        disabled={pendingId != null}
                        aria-busy={pendingId === r.id}
                        onClick={() => handleComplete(r.id)}
                        title={t("Complete")}
                      >
                        <CheckCheck size={15} />
                      </button>
                      <button
                        disabled={pendingId != null}
                        aria-busy={pendingId === r.id}
                        onClick={() => handleCancel(r.id)}
                        title={t("Cancel")}
                        className="danger"
                      >
                        <X size={15} />
                      </button>
                    </>
                  )}

                  {(r.status === "completed" || r.status === "cancelled") && (
                    <span
                      style={{ color: "var(--muted)", fontSize: "0.78rem" }}
                    >
                      {t("No actions")}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={10}
                style={{
                  textAlign: "center",
                  color: "var(--muted)",
                  padding: "2rem",
                }}
              >
                {t("No reservations in this view.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination {...pagination} />
    </div>
  );
}
