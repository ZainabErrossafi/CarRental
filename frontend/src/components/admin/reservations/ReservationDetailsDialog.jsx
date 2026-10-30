import { useI18n } from "../../../context/I18nContext";
import { X, Printer } from "lucide-react";
import { formatReservationDate } from "../../../services/reservationInvoice";

export default function ReservationDetailsDialog({
  viewing,
  setViewing,
  durationDays,
  printError,
  handlePrint,
}) {
  const { t } = useI18n();
  return (
    <div className="modal-overlay" onClick={() => setViewing(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{viewing.reference}</h3>
            <span className={`badge badge-${viewing.status}`}>
              {t(viewing.status)}
            </span>
          </div>
          <button className="modal-close" onClick={() => setViewing(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">{t("Vehicle")}</span>
            <span className="detail-value">
              {viewing.vehicle_name || viewing.vehicle}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Driver")}</span>
            <span className="detail-value">{viewing.driver_name}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Phone")}</span>
            <span className="detail-value">{viewing.phone}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Email")}</span>
            <span className="detail-value">{viewing.email}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Pickup Location")}</span>
            <span className="detail-value">
              {viewing.pickup_location_name ||
                viewing.pickup_location ||
                t("N/A")}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Dropoff Location")}</span>
            <span className="detail-value">
              {viewing.dropoff_location_name ||
                viewing.dropoff_location ||
                t("N/A")}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Pickup Date")}</span>
            <span className="detail-value">
              {formatReservationDate(viewing.pickup_date)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Return Date")}</span>
            <span className="detail-value">
              {formatReservationDate(viewing.return_date)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Duration")}</span>
            <span className="detail-value">
              {t(durationDays(viewing) === 1 ? "{count} day" : "{count} days", {
                count: durationDays(viewing),
              })}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Extras")}</span>
            <span className="detail-value">
              {viewing.extra_details?.length
                ? viewing.extra_details
                    .map((extra) => `${extra.name} × ${extra.quantity}`)
                    .join(", ")
                : t("None")}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Features")}</span>
            <span className="detail-value">
              {viewing.features?.length
                ? viewing.features.map((name) => t(name)).join(", ")
                : t("None")}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Total Price")}</span>
            <span className="detail-value">
              <strong>
                {viewing.total_price} {t("MAD")}
              </strong>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Created At")}</span>
            <span className="detail-value">
              {formatReservationDate(viewing.created_at)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">{t("Updated At")}</span>
            <span className="detail-value">
              {formatReservationDate(viewing.updated_at)}
            </span>
          </div>
        </div>

        {printError && (
          <div role="alert" className="alert alert-error">
            {printError}
          </div>
        )}
        <div className="modal-footer" style={{ gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
          >
            <Printer size={16} /> {t("Print Invoice")}
          </button>
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
