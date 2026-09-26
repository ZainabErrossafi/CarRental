import { useEffect, useMemo, useState } from "react";
import { Check, X, CheckCheck, User, Phone, Mail, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getReservations,
  confirmReservation,
  cancelReservation,
  completeReservation,
} from "../../services/adminApi";

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
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [tab, setTab] = useState("All");
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    getReservations().then(setReservations);
  }, []);

  const filtered = useMemo(() => {
    if (tab === "All") return reservations;
    return reservations.filter((r) => r.status === tab.toLowerCase());
  }, [reservations, tab]);

  const applyUpdate = (updated) => {
    setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // Mirrors the Reservation model's confirm() / cancel() / complete() methods.
  const handleConfirm = async (id) => {
    if (!confirm("Are you sure you want to confirm this reservation?")) return;
    applyUpdate(await confirmReservation(id));
  };
  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    applyUpdate(await cancelReservation(id));
  };
  const handleComplete = async (id) => {
    if (!confirm("Are you sure you want to mark this reservation as completed?")) return;
    applyUpdate(await completeReservation(id));
  };

  // Mirrors the Reservation model's duration_days() method.
  const durationDays = (r) => {
    const start = new Date(r.pickup_date);
    const end = new Date(r.return_date);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Reservations</h1>
        <div className="page-header-actions">
          <button className="btn-pill" onClick={() => navigate("/admin/reservations/new")}>
            <Plus size={16} strokeWidth={2.5} />
            New Reservation
          </button>
        </div>
      </div>

      <div className="pill-tabs">
        {STATUS_TABS.map((t) => (
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
          {tab === "All" ? "All Reservations" : `${tab} Reservations`}
          <span className="count-pill">{filtered.length}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Pickup → Return</th>
              <th>Duration</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.reference}</strong>
                </td>

                <td>{r.vehicle}</td>

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

                <td>{r.pickup_date} → {r.return_date}</td>

                <td>{durationDays(r)} day{durationDays(r) > 1 ? "s" : ""}</td>

                <td>{r.total_price} MAD</td>

                <td>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                </td>

                <td>
                  <div className="row-actions">
                    <button onClick={() => setViewing(r)} title="View details">
                      <EyeIcon size={15} />
                    </button>

                    {r.status === "pending" && (
                      <>
                        <button onClick={() => handleConfirm(r.id)} title="Confirm">
                          <Check size={15} />
                        </button>
                        <button onClick={() => handleCancel(r.id)} title="Cancel" className="danger">
                          <X size={15} />
                        </button>
                      </>
                    )}

                    {r.status === "confirmed" && (
                      <>
                        <button onClick={() => handleComplete(r.id)} title="Complete">
                          <CheckCheck size={15} />
                        </button>
                        <button onClick={() => handleCancel(r.id)} title="Cancel" className="danger">
                          <X size={15} />
                        </button>
                      </>
                    )}

                    {(r.status === "completed" || r.status === "cancelled") && (
                      <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>No actions</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  No reservations in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{viewing.reference}</h3>
                <span className={`badge badge-${viewing.status}`}>{viewing.status}</span>
              </div>
              <button className="modal-close" onClick={() => setViewing(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Vehicle</span>
                <span className="detail-value">{viewing.vehicle}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Driver</span>
                <span className="detail-value">{viewing.driver_name}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{viewing.phone}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{viewing.email}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Pickup Date</span>
                <span className="detail-value">{viewing.pickup_date}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Return Date</span>
                <span className="detail-value">{viewing.return_date}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Duration</span>
                <span className="detail-value">
                  {durationDays(viewing)} day{durationDays(viewing) > 1 ? "s" : ""}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Total Price</span>
                <span className="detail-value"><strong>{viewing.total_price} MAD</strong></span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Created At</span>
                <span className="detail-value">{viewing.created_at}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Updated At</span>
                <span className="detail-value">{viewing.updated_at}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}