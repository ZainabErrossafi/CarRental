import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { useRef, useState } from "react";
import api from "../../services/api.js";

export default function ReservationItem({ item, onClose, onUpdated }) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  const cancelReservation = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`reservations/${item.id}/cancel/`);
      onUpdated({ ...item, ...data });
      setConfirmCancel(false);
    } catch (err) {
      setError(err.message || "Could not cancel this reservation. Please try again.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const date = (value) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));
  return (
    <article>
      <div className="reservation-popover-row">
        <small>{item.reference}</small>
        <span className={`reservation-status status-${item.status}`}>{item.status}</span>
      </div>
      <Link to={`/vehicles/${item.vehicle}`} onClick={() => onClose()}>
        {item.vehicle_name}
      </Link>
      <p>
        <CalendarDays size={13} aria-hidden="true" />
        {date(item.pickup_date)} → {date(item.return_date)}
      </p>
      <div className="reservation-popover-row">
        <span>{item.pickup_location_name}</span>
        <strong>{Number(item.total_price).toLocaleString()} MAD</strong>
      </div>
      {["pending", "confirmed"].includes(item.status) && (
        <div className="reservation-cancel-actions">
          {confirmCancel ? (
            <>
              <p>Cancel this reservation?</p>
              <div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setConfirmCancel(false);
                    setError("");
                  }}
                >
                  Keep booking
                </button>
                <button
                  className="reservation-cancel-confirm"
                  type="button"
                  disabled={busy}
                  onClick={cancelReservation}
                >
                  {busy ? "Cancelling…" : "Yes, cancel"}
                </button>
              </div>
            </>
          ) : (
            <button
              className="reservation-cancel-trigger"
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirmCancel(true);
                setError("");
              }}
            >
              Cancel reservation
            </button>
          )}
        </div>
      )}
      {error && (
        <p className="reservation-cancel-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
