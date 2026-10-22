import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TicketCheck, X, RefreshCw, CalendarDays } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api, { getList } from "../../services/api.js";

export default function ReservationsDropdown({ overlay }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const cancelInFlight = useRef(false);
  const cancelReservation = async (item) => {
    if (cancelInFlight.current) return;
    cancelInFlight.current = true;
    setCancelling(item.id); setCancelError(null);
    try {
      const { data } = await api.post(`reservations/${item.id}/cancel/`);
      setItems((previous) => previous.map((booking) => booking.id === item.id ? { ...booking, ...data } : booking));
      setConfirmCancel(null);
    } catch (err) { setCancelError({ id: item.id, message: err.message || "Could not cancel this reservation. Please try again." }); }
    finally { setCancelling(null); cancelInFlight.current = false; }
  };
  const root = useRef(null);
  const trigger = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname, user?.id]);
  useEffect(() => {
    const outside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    const show = () => { setOpen(true); setRetry((value) => value + 1); trigger.current?.scrollIntoView({ block: "nearest" }); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("rently:show-reservations", show);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("rently:show-reservations", show); };
  }, []);
  useEffect(() => {
    if (!open || !user) return;
    let active = true;
    setLoading(true); setError("");
    getList(`reservations/?user=${encodeURIComponent(user.id)}`).then((data) => { if (active) setItems(data.filter((item) => String(item.user) === String(user.id))); })
      .catch(() => { if (active) setError("Could not load your reservations."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, user, retry]);
  const date = (value) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));
  return <div className="reservation-popover-root" ref={root}>
    <button type="button" ref={trigger} aria-label="My reservations" title="My reservations" aria-expanded={open} aria-controls="reservation-popover" className={`client-reservations-link${overlay ? " is-overlay" : ""}`} onClick={() => setOpen(!open)}><TicketCheck size={20} aria-hidden="true" /></button>
    {open && <section id="reservation-popover" className="reservation-popover" aria-label="My reservations"><header><div><strong>My reservations</strong><span>Your bookings at a glance</span></div><button type="button" aria-label="Refresh reservations" onClick={() => setRetry((value) => value + 1)}><RefreshCw size={15} aria-hidden="true" /></button><button type="button" aria-label="Close reservations" onClick={() => { setOpen(false); trigger.current?.focus(); }}><X size={17} aria-hidden="true" /></button></header><div className="reservation-popover-list">
      {loading ? <p role="status" className="reservation-popover-empty">Loading…</p> : error ? <p role="alert" className="reservation-popover-empty">{error}</p> : !items.length ? <div className="reservation-popover-empty"><TicketCheck size={28} aria-hidden="true" /><p>No reservations yet.</p><Link to="/vehicles" onClick={() => setOpen(false)}>Explore vehicles</Link></div> : items.map((item) => <article key={item.id}><div className="reservation-popover-row"><small>{item.reference}</small><span className={`reservation-status status-${item.status}`}>{item.status}</span></div><Link to={`/vehicles/${item.vehicle}`} onClick={() => setOpen(false)}>{item.vehicle_name}</Link><p><CalendarDays size={13} aria-hidden="true" />{date(item.pickup_date)} → {date(item.return_date)}</p><div className="reservation-popover-row"><span>{item.pickup_location_name}</span><strong>{Number(item.total_price).toLocaleString()} MAD</strong></div>{["pending", "confirmed"].includes(item.status) && <div className="reservation-cancel-actions">{confirmCancel === item.id ? <><p>Cancel this reservation?</p><div><button type="button" disabled={cancelling !== null} onClick={() => { setConfirmCancel(null); setCancelError(null); }}>Keep booking</button><button className="reservation-cancel-confirm" type="button" disabled={cancelling !== null} onClick={() => cancelReservation(item)}>{cancelling === item.id ? "Cancelling…" : "Yes, cancel"}</button></div></> : <button className="reservation-cancel-trigger" type="button" disabled={cancelling !== null} onClick={() => { setConfirmCancel(item.id); setCancelError(null); }}>Cancel reservation</button>}</div>}{cancelError?.id === item.id && <p className="reservation-cancel-error" role="alert">{cancelError.message}</p>}</article>)}
    </div></section>}
  </div>;
}
