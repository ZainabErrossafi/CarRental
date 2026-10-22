import { CATALOG_ICONS } from "../CatalogIcons.jsx";
import CompactDropdown from "./CompactDropdown.jsx";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api, { getList } from "../../services/api.js";

const localMinute = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const nextMinute = () => localMinute(new Date(Math.floor(Date.now() / 60000) * 60000 + 60000));

export default function VehicleBooking({ vehicle }) {
  const { user, loading } = useAuth();
  const [locations, setLocations] = useState([]);
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [extrasError, setExtrasError] = useState(false);
  useEffect(() => {
    let active = true;
    getList("extras/").then((items) => {
      if (active) setExtras(items.filter((item) => item.active && item.max_qty > 0));
    }).catch(() => { if (active) setExtrasError(true); })
      .finally(() => { if (active) setExtrasLoading(false); });
    return () => { active = false; };
  }, []);
  const [form, setForm] = useState({ pickup: "", returned: "", pickup_location: "", dropoff_location: "", driver_name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reservation, setReservation] = useState(null);
  const submitting = useRef(false);
  const [minimumPickup, setMinimumPickup] = useState(nextMinute);
  useEffect(() => {
    const update = () => setMinimumPickup(nextMinute());
    const timer = window.setInterval(update, 15000);
    window.addEventListener("focus", update);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", update); };
  }, []);
  const minimumReturn = form.pickup && form.pickup >= minimumPickup
    ? localMinute(new Date(new Date(form.pickup).getTime() + 60000)) : minimumPickup;
  const money = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value));
  useEffect(() => {
    if (!user) return;
    let active = true;
    setForm((prev) => ({ ...prev, driver_name: prev.driver_name || user.name || "", email: user.email || "", phone: prev.phone || user.phone || "" }));
    setLocationError(false);
    getList("locations/").then((items) => { if (active) setLocations(items.filter((item) => item.active)); }).catch(() => { if (active) setLocationError(true); });
    return () => { active = false; };
  }, [user]);
  const change = (field) => (event) => {
    setError("");
    let value = event.target.value;
    if (value && (field === "pickup" || field === "returned")) {
      const currentMinimum = nextMinute();
      const limit = field === "returned" && form.pickup >= currentMinimum
        ? localMinute(new Date(new Date(form.pickup).getTime() + 60000)) : currentMinimum;
      if (value < limit) {
        value = limit;
        setError(field === "pickup" ? "Past times are not allowed. Pick-up was moved to the next available minute." : "Return must be after pick-up and cannot be in the past. The time was adjusted.");
      }
      setMinimumPickup(currentMinimum);
    }
    setForm((prev) => ({ ...prev, [field]: value, ...(field === "pickup" && prev.returned && prev.returned <= value ? { returned: "" } : {}) }));
  };
  const duration = form.pickup && form.returned ? Math.ceil((new Date(form.returned) - new Date(form.pickup)) / 86400000) : 0;
  const extrasTotal = extras.filter((item) => selectedExtras.includes(item.id))
    .reduce((total, item) => total + Number(item.price_per_day) * Math.max(duration, 0) + Number(item.flat_price), 0);
  const valid = duration > 0 && new Date(form.pickup) > new Date();
  const contactComplete = Boolean(form.driver_name.trim() && form.phone.trim() && user?.email?.trim());
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || reservation) return;
    if (![form.pickup, form.returned].every((value) => /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value))) {
      setError("Enter valid times from 00:00 to 23:59."); return;
    }
    if (!form.pickup_location || !form.dropoff_location) { setError("Select pick-up and return agencies."); return; }
    if (!contactComplete) { setError("Driver name, phone number and account email are required to book."); return; }
    if (!valid) { setError("Choose a future pick-up time and a later return time."); return; }
    submitting.current = true; setBusy(true); setError("");
    try {
      const { data } = await api.post("reservations/", { vehicle: vehicle.id, extras: selectedExtras, pickup_location: Number(form.pickup_location), dropoff_location: Number(form.dropoff_location), pickup_date: new Date(form.pickup).toISOString(), return_date: new Date(form.returned).toISOString(), driver_name: form.driver_name.trim(), email: user.email, phone: form.phone.trim() });
      setReservation(data);
    } catch (err) { setError(err.message || "Could not create your reservation. Please try again."); }
    finally { submitting.current = false; setBusy(false); }
  };
  if (reservation) return <aside className="vehicle-booking-card booking-success" role="status"><div className="booking-success-icon"><Check size={27} aria-hidden="true" /></div><span className="booking-success-eyebrow">ALL SET FOR THE NEXT STEP</span><h2>Request received!</h2><p>We’ll review your reservation and confirm it shortly.</p><div className="booking-success-summary"><span>Booking reference<strong>{reservation.reference}</strong></span><span>Total rental<strong>{money(reservation.total_price)} MAD</strong></span><span>Status<strong className="booking-pending">Pending confirmation</strong></span></div><button type="button" className="vehicle-booking-button vehicle-booking-signin" onClick={() => window.dispatchEvent(new Event("rently:show-reservations"))}>My reservations <ArrowRight size={16} aria-hidden="true" /></button><Link className="booking-success-back" to="/vehicles">Continue exploring vehicles</Link></aside>;
  return <aside className="vehicle-booking-card" aria-label="Book this vehicle"><div className="vehicle-booking-rate"><strong>{money(vehicle.pricePerDay)}</strong><span>MAD / day</span></div>
    <form onSubmit={submit}>
      <fieldset disabled={busy || loading} className="vehicle-booking-form">
        <div className="vehicle-booking-dates">{[
          ["pickup", "Pick-up", minimumPickup], ["returned", "Return", minimumReturn],
        ].map(([field, label, minimum]) => {
          const [date = "", time = ""] = form[field].split("T");
          return <div className="vehicle-booking-date-group" key={field}>
            <label>{label} date<input type="date" required min={minimum.slice(0, 10)} value={date} onChange={(event) => change(field)({ target: { value: event.target.value ? `${event.target.value}T${time || minimum.slice(11)}` : "" } })} /></label>
            <label>{label} time <input key={`${field}-${date}-${time}`} type="text" inputMode="numeric" placeholder="HH:MM" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" maxLength={5} title="Enter a 24-hour time, for example 14:30" aria-label={`${label} time in 24-hour format`} required disabled={!date} defaultValue={time} data-last-valid={time} onInput={(event) => {
              const digits = event.currentTarget.value.replace(/\D/g, "").slice(0, 4);
              const input = event.currentTarget;
              const invalidHour = digits.length === 1 ? Number(digits) > 2 : Number(digits.slice(0, 2)) > 23;
              const invalidMinute = digits.length === 3 ? Number(digits[2]) > 5 : digits.length === 4 && Number(digits.slice(2)) > 59;
              if (invalidHour || invalidMinute) {
                input.value = input.dataset.lastValid || "";
                return;
              }
              input.value = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
              input.dataset.lastValid = input.value;
            }} onBlur={(event) => {
              if (!date || !event.target.value || !event.target.validity.valid) return;
              change(field)({ target: { value: `${date}T${event.target.value}` } });
            }} /></label>
          </div>;
        })}</div>
        {user && <><div className="vehicle-booking-fields"><CompactDropdown label="Pick-up agency" value={form.pickup_location} placeholder="Select an agency" disabled={busy || loading} onChange={(value) => change("pickup_location")({ target: { value } })} options={locations.map((item) => ({ value: item.id, label: `${item.name} · ${item.city}` }))} /><CompactDropdown label="Return agency" value={form.dropoff_location} placeholder="Select an agency" disabled={busy || loading} onChange={(value) => change("dropoff_location")({ target: { value } })} options={locations.map((item) => ({ value: item.id, label: `${item.name} · ${item.city}` }))} /><label>Driver name<input required maxLength={100} value={form.driver_name} onChange={change("driver_name")} autoComplete="name" /></label><label>Email<input required type="email" value={user.email || ""} readOnly autoComplete="email" aria-label="Account email" /></label><label>Phone<input required type="tel" maxLength={20} value={form.phone} onChange={change("phone")} autoComplete="tel" /></label></div>{locationError && <p role="alert">Could not load agencies. Refresh to try again.</p>}</>}
        <details className="booking-extras booking-extras-picker">
          <summary><span><strong>Optional extras</strong><small>Personalize your rental</small></span><span className="booking-extras-count" aria-live="polite">{selectedExtras.length ? `${selectedExtras.length} added` : "Add extras"}</span><span className="booking-extras-chevron" aria-hidden="true">⌄</span></summary>
          {extrasLoading ? <p role="status">Loading extras…</p> : extrasError ? <p role="status">Extras are temporarily unavailable. You can still book without them.</p> : !extras.length ? <p>No extras available.</p> : <div className="booking-extras-list" tabIndex={0} role="group" aria-label="Available optional extras">{extras.map((extra) => {
            const Icon = CATALOG_ICONS[extra.icon] || CATALOG_ICONS.tag;
            return (
            <label key={extra.id} className="booking-extra-option">
              <input type="checkbox" checked={selectedExtras.includes(extra.id)} onChange={(event) => {
                setError("");
                setSelectedExtras((prev) => event.target.checked ? [...prev, extra.id] : prev.filter((id) => id !== extra.id));
              }} />
              <span className="booking-extra-content"><span className="booking-extra-icon"><Icon size={18} strokeWidth={1.6} aria-hidden="true" /></span><span className="booking-extra-copy"><strong>{extra.name}</strong><small>{[
                Number(extra.price_per_day) > 0 && `${money(extra.price_per_day)} MAD / day`,
                Number(extra.flat_price) > 0 && `${money(extra.flat_price)} MAD once`,
              ].filter(Boolean).join(" + ") || "Included"}</small></span></span>
            </label>
          ); })}</div>}
        </details>
        <div className="vehicle-booking-estimate" aria-live="polite"><h2>Total</h2>{valid ? <><strong>{money(duration * vehicle.pricePerDay + extrasTotal)} MAD</strong><p>{duration} {duration === 1 ? "day" : "days"} · Includes selected extras. Deposit excluded.</p></> : <p>Select a future pick-up and a later return.</p>}</div>
        {error && <p className="vehicle-booking-error" role="alert">{error}</p>}
        {!loading && !user ? <Link className="vehicle-booking-button vehicle-booking-signin" to="/login" state={{ from: { pathname: `/vehicles/${vehicle.id}` } }}>Sign in to book this car <ArrowRight size={17} aria-hidden="true" /></Link> : <button type="submit" className="vehicle-booking-button" disabled={busy || loading || !valid || !contactComplete || !locations.length || locationError}>{busy ? "Booking…" : "Book now"}<ArrowRight size={17} aria-hidden="true" /></button>}
        <p className="vehicle-booking-note">Availability and final price are checked when you submit. Reservations require confirmation.</p>
      </fieldset>
    </form>
  </aside>;
}
