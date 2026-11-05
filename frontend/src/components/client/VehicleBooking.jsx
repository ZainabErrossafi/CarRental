import { useAuth } from "../../context/AuthContext";
import BookingExtras from "./BookingExtras.jsx";
import BookingSuccess from "./BookingSuccess.jsx";
import BookingDates from "./BookingDates.jsx";
import BookingContact from "./BookingContact.jsx";
import { money, bookingDuration, bookingExtrasTotal, validateBooking } from "../../utils/bookingHelpers.js";
import { localMinute, nextMinute, tripFromSearch } from "../../utils/bookingDates.js";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api, { getList } from "../../services/api.js";

export default function VehicleBooking({ vehicle }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [locations, setLocations] = useState([]);
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const changeExtra = (id, checked) => {
    setError("");
    setSelectedExtras((previous) => (checked ? [...previous, id] : previous.filter((value) => value !== id)));
  };
  const [form, setForm] = useState(() => ({
    ...tripFromSearch(location.search),
    driver_name: "",
    phone: "",
  }));
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reservation, setReservation] = useState(null);
  const submitting = useRef(false);
  const [minimumPickup, setMinimumPickup] = useState(nextMinute);
  useEffect(() => {
    const update = () => setMinimumPickup(nextMinute());
    const timer = window.setInterval(update, 15000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  const minimumReturn =
    form.pickup && form.pickup >= minimumPickup
      ? localMinute(new Date(new Date(form.pickup).getTime() + 60000))
      : minimumPickup;
  useEffect(() => {
    if (!user) return;
    let active = true;
    setForm((prev) => ({
      ...prev,
      driver_name: prev.driver_name || user.name || "",
      phone: prev.phone || user.phone || "",
    }));
    setLocationError(false);
    getList("locations/")
      .then((items) => {
        if (active) {
          const agencies = items.filter((item) => item.active);
          setLocations(agencies);
          setForm((prev) => ({
            ...prev,
            pickup_location: agencies.some((item) => String(item.id) === prev.pickup_location)
              ? prev.pickup_location
              : "",
            dropoff_location: agencies.some((item) => String(item.id) === prev.dropoff_location)
              ? prev.dropoff_location
              : "",
          }));
        }
      })
      .catch(() => {
        if (active) setLocationError(true);
      });
    return () => {
      active = false;
    };
  }, [user]);
  const change = (field) => (event) => {
    setError("");
    setUnavailable(false);
    let value = event.target.value;
    if (value && (field === "pickup" || field === "returned")) {
      const currentMinimum = nextMinute();
      const limit =
        field === "returned" && form.pickup >= currentMinimum
          ? localMinute(new Date(new Date(form.pickup).getTime() + 60000))
          : currentMinimum;
      if (value < limit) {
        value = limit;
        setError(
          field === "pickup"
            ? "Past times are not allowed. Pick-up was moved to the next available minute."
            : "Return must be after pick-up and cannot be in the past. The time was adjusted.",
        );
      }
      setMinimumPickup(currentMinimum);
    }
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "pickup" && prev.returned && prev.returned <= value ? { returned: "" } : {}),
    }));
  };
  const changeDate = (field, value) => {
    if (value.length === 10) setForm((previous) => ({ ...previous, [field]: value }));
    else change(field)({ target: { value } });
  };
  const duration = bookingDuration(form.pickup, form.returned);
  const extrasTotal = bookingExtrasTotal(extras, selectedExtras, duration);
  const valid = duration > 0 && new Date(form.pickup) > new Date();
  const contactComplete = Boolean(form.driver_name.trim() && form.phone.trim() && user?.email?.trim());
  const agencyOptions = locations.map((item) => ({ value: item.id, label: `${item.name} · ${item.city}` }));
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || reservation) return;
    const validationError = validateBooking(form, contactComplete, valid);
    if (validationError) {
      setError(validationError);
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("reservations/", {
        vehicle: vehicle.id,
        extras: selectedExtras,
        pickup_location: Number(form.pickup_location),
        dropoff_location: Number(form.dropoff_location),
        pickup_date: new Date(form.pickup).toISOString(),
        return_date: new Date(form.returned).toISOString(),
        driver_name: form.driver_name.trim(),
        email: user.email,
        phone: form.phone.trim(),
      });
      setReservation(data);
    } catch (err) {
      const message = err.message || "Could not create your reservation. Please try again.";
      setError(message);
      if (message.toLowerCase().includes("not available")) setUnavailable(true);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  if (reservation) return <BookingSuccess reservation={reservation} money={money} />;
  return (
    <aside className="vehicle-booking-card" aria-label="Book this vehicle">
      <div className="vehicle-booking-rate">
        <strong>{money(vehicle.pricePerDay)}</strong>
        <span>MAD / day</span>
      </div>
      <form onSubmit={submit}>
        <fieldset disabled={busy || loading} className="vehicle-booking-form">
          <BookingDates
            values={form}
            onChange={changeDate}
            minimum={{ pickup: minimumPickup, returned: minimumReturn }}
          />
          {user && (
            <>
              <BookingContact form={form} onChange={change} agencies={agencyOptions} />
              {locationError && <p role="alert">Could not load agencies. Refresh to try again.</p>}
            </>
          )}
          {user && <BookingExtras selectedExtras={selectedExtras} onChange={changeExtra} onLoaded={setExtras} />}
          <div className="vehicle-booking-estimate" aria-live="polite">
            <h2>Total</h2>
            {valid ? (
              <>
                <strong>{money(duration * vehicle.pricePerDay + extrasTotal)} MAD</strong>
                <p>
                  {duration} {duration === 1 ? "day" : "days"} · Includes selected extras. Deposit excluded.
                </p>
              </>
            ) : (
              <p>Select a future pick-up and a later return.</p>
            )}
          </div>
          {error && (
            <p className="vehicle-booking-error" role="alert">
              {error}
            </p>
          )}
          {!loading && !user ? (
            <Link className="vehicle-booking-button vehicle-booking-signin" to="/login" state={{ from: location }}>
              Sign in to book this car <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="submit"
              className="vehicle-booking-button"
              disabled={
                busy || loading || unavailable || !valid || !contactComplete || !locations.length || locationError
              }
            >
              {busy ? "Booking…" : "Book now"}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          )}
          <p className="vehicle-booking-note">
            Availability and final price are checked when you submit. Reservations require confirmation.
          </p>
        </fieldset>
      </form>
    </aside>
  );
}
