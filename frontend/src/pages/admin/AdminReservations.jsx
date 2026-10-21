import { formatReservationDate, printReservationInvoice } from "../../services/reservationInvoice";
import { useI18n } from "../../context/I18nContext";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useMemo, useState } from "react";
import { Check, X, CheckCheck, User, Phone, Mail, Plus, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getReservations,
  confirmReservation,
  cancelReservation,
  completeReservation,
} from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

const STATUS_TABS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

function EyeIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none">
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

export default function AdminReservations() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState("All");
  const [viewing, setViewing] = useState(null);
  const [printError, setPrintError] = useState(null);
  const handlePrint = () => {
    setPrintError(null);
    try { printReservationInvoice(viewing, t); }
    catch (error) { setPrintError(error.message); }
  };

  useEffect(() => {
    getReservations().then(setReservations);
  }, []);

  const filtered = useMemo(() => {
    if (tab === "All") return reservations;
    return reservations.filter((r) => r.status === tab.toLowerCase());
  }, [reservations, tab]);

  const pagination = usePagination(filtered, tab);

  const applyUpdate = (updated) => {
    setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleConfirm = async (id) => {
    if (!(await confirm("Are you sure you want to confirm this reservation?", { confirmLabel: "Confirm" }))) return;
    applyUpdate(await confirmReservation(id));
  };
  const handleCancel = async (id) => {
    if (!(await confirm("Are you sure you want to cancel this reservation?", { danger: true, confirmLabel: "Cancel Reservation", cancelLabel: "Back" }))) return;
    applyUpdate(await cancelReservation(id));
  };
  const handleComplete = async (id) => {
    if (!(await confirm("Are you sure you want to mark this reservation as completed?", { confirmLabel: "Mark Completed" }))) return;
    applyUpdate(await completeReservation(id));
  };

  const durationDays = (r) => {
    const start = new Date(r.pickup_date);
    const end = new Date(r.return_date);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t("Reservations")}</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={() => navigate("/admin/reservations/new")}>
            <Plus size={16} strokeWidth={2.5} />
            {t("New Reservation")}
          </button>
        </div>
      </div>

      <div className="pill-tabs">
        {STATUS_TABS.map((tabLabel) => (
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
          {tab === "All" ? t("All Reservations") : t("{value0} Reservations", { value0: t(tab) })}
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

                <td>{formatReservationDate(r.pickup_date)} → {formatReservationDate(r.return_date)}</td>

                <td>{t(durationDays(r) === 1 ? "{count} day" : "{count} days", { count: durationDays(r) })}</td>

                <td>{r.total_price} {t("MAD")}</td>

                <td>
                  <span className={`badge badge-${r.status}`}>{t(r.status)}</span>
                </td>

                <td>
                  <div className="row-actions">
                    <button onClick={() => setViewing(r)} title={t("View details")}>
                      <EyeIcon size={15} />
                    </button>

                    {r.status === "pending" && (
                      <>
                        <button onClick={() => handleConfirm(r.id)} title={t("Confirm")}>
                          <Check size={15} />
                        </button>
                        <button onClick={() => handleCancel(r.id)} title={t("Cancel")} className="danger">
                          <X size={15} />
                        </button>
                      </>
                    )}

                    {r.status === "confirmed" && (
                      <>
                        <button onClick={() => handleComplete(r.id)} title={t("Complete")}>
                          <CheckCheck size={15} />
                        </button>
                        <button onClick={() => handleCancel(r.id)} title={t("Cancel")} className="danger">
                          <X size={15} />
                        </button>
                      </>
                    )}

                    {(r.status === "completed" || r.status === "cancelled") && (
                      <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{t("No actions")}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  {t("No reservations in this view.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>

      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{viewing.reference}</h3>
                <span className={`badge badge-${viewing.status}`}>{t(viewing.status)}</span>
              </div>
              <button className="modal-close" onClick={() => setViewing(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">{t("Vehicle")}</span>
                <span className="detail-value">{viewing.vehicle_name || viewing.vehicle}</span>
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
                <span className="detail-value">{viewing.pickup_location_name || viewing.pickup_location || t("N/A")}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t("Dropoff Location")}</span>
                <span className="detail-value">{viewing.dropoff_location_name || viewing.dropoff_location || t("N/A")}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t("Pickup Date")}</span>
                <span className="detail-value">{formatReservationDate(viewing.pickup_date)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t("Return Date")}</span>
                <span className="detail-value">{formatReservationDate(viewing.return_date)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t("Duration")}</span>
                <span className="detail-value">
                  {t(durationDays(viewing) === 1 ? "{count} day" : "{count} days", { count: durationDays(viewing) })}
                </span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">{t("Extras")}</span>
                <span className="detail-value">
                  {viewing.extra_details?.length
                    ? viewing.extra_details.map((extra) => `${extra.name} × ${extra.quantity}`).join(", ")
                    : t("None")}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t("Total Price")}</span>
                <span className="detail-value"><strong>{viewing.total_price} {t("MAD")}</strong></span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t("Created At")}</span>
                <span className="detail-value">{formatReservationDate(viewing.created_at)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">{t("Updated At")}</span>
                <span className="detail-value">{formatReservationDate(viewing.updated_at)}</span>
              </div>
            </div>

            {printError && <div role="alert" className="alert alert-error">{printError}</div>}
            <div className="modal-footer" style={{ gap: "0.75rem" }}>
              <button type="button" className="btn btn-primary" onClick={handlePrint}>
                <Printer size={16} /> {t("Print Invoice")}
              </button>
              <button className="btn btn-secondary" onClick={() => setViewing(null)}>
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}