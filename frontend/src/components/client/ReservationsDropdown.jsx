import ReservationItem from "./ReservationItem.jsx";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TicketCheck, X, RefreshCw } from "lucide-react";
import { getList } from "../../services/api.js";

export default function ReservationsDropdown({ overlay }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const updateReservation = (updated) => {
    setItems((previous) => previous.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
  };
  const root = useRef(null);
  const trigger = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname, userId]);
  useEffect(() => {
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const show = () => {
      setOpen(true);
      setRetry((value) => value + 1);
      trigger.current?.scrollIntoView({ block: "nearest" });
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("rently:show-reservations", show);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("rently:show-reservations", show);
    };
  }, []);
  useEffect(() => {
    if (!open || !userId) return;
    let active = true;
    setLoading(true);
    setError("");
    getList(`reservations/?user=${encodeURIComponent(userId)}`)
      .then((data) => {
        if (active) setItems(data.filter((item) => String(item.user) === String(userId)));
      })
      .catch(() => {
        if (active) setError("Could not load your reservations.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, userId, retry]);
  return (
    <div className="reservation-popover-root" ref={root}>
      <button
        type="button"
        ref={trigger}
        aria-label="My reservations"
        title="My reservations"
        aria-expanded={open}
        aria-controls="reservation-popover"
        className={`client-reservations-link${overlay ? " is-overlay" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <TicketCheck size={20} aria-hidden="true" />
      </button>
      {open && (
        <section id="reservation-popover" className="reservation-popover" aria-label="My reservations">
          <header>
            <div>
              <strong>My reservations</strong>
              <span>Your bookings at a glance</span>
            </div>
            <button type="button" aria-label="Refresh reservations" onClick={() => setRetry((value) => value + 1)}>
              <RefreshCw size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Close reservations"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </header>
          <div className="reservation-popover-list">
            {loading ? (
              <p role="status" className="reservation-popover-empty">
                Loading…
              </p>
            ) : error ? (
              <p role="alert" className="reservation-popover-empty">
                {error}
              </p>
            ) : !items.length ? (
              <div className="reservation-popover-empty">
                <TicketCheck size={28} aria-hidden="true" />
                <p>No reservations yet.</p>
                <Link to="/vehicles" onClick={() => setOpen(false)}>
                  Explore vehicles
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <ReservationItem
                  key={item.id}
                  item={item}
                  onClose={() => setOpen(false)}
                  onUpdated={updateReservation}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
