import { useAuth } from "../../context/AuthContext";
import BookingExtras from "./BookingExtras.jsx";
import BookingSuccess from "./BookingSuccess.jsx";
import CompactDropdown from "./CompactDropdown.jsx";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api, { getList } from "../../services/api.js";

const localMinute = (date) => {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const nextMinute = () => localMinute(new Date(Math.floor(Date.now() / 60000) * 60000 + 60000));

const tripFromSearch = (search) => {
  const params = new URLSearchParams(search);
  const readTime = (kind) => {
    const value = `${params.get(`${kind}_date`)}T${params.get(`${kind}_time`)}`;
    if (!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value)) return "";
    const date = new Date(value);
    return Number.isFinite(date.getTime()) && localMinute(date) === value && date > new Date() ? value : "";
  };
  const pickup = readTime("departure");
  const returned = readTime("return");
  const readAgency = (key) => /^\d+$/.test(params.get(key) || "") && Number(params.get(key)) > 0 ? params.get(key) : "";
  return {
    pickup,
    returned: pickup && returned > pickup ? returned : "",
    pickup_location: readAgency("pickup_location"),
    dropoff_location: readAgency("dropoff_location"),
  };
};

export default function VehicleBooking({ vehicle }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [locations, setLocations] = useState([]);
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const changeExtra = (id, checked) => {
    setError("");
    setSelectedExtras((previous) => checked ? [...previous, id] : previous.filter((value) => value !== id));
  };
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [extrasError, setExtrasError] = useState(false);
  useEffect(() => {
    let active = true;
    getList("extras/")
      .then((items) => {
        if (active) setExtras(items.filter((item) => item.active && item.max_qty > 0));
      })
      .catch(() => {
        if (active) setExtrasError(true);
      })
      .finally(() => {
        if (active) setExtrasLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const [form, setForm] = useState(() => ({
    ...tripFromSearch(location.search),
    driver_name: "",
    email: "",
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
  const money = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value));
  useEffect(() => {
    if (!user) return;
    let active = true;
    setForm((prev) => ({
      ...prev,
      driver_name: prev.driver_name || user.name || "",
      email: user.email || "",
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
            pickup_location: agencies.some((item) => String(item.id) === prev.pickup_location) ? prev.pickup_location : "",
            dropoff_location: agencies.some((item) => String(item.id) === prev.dropoff_location) ? prev.dropoff_location : "",
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
  const duration =
    form.pickup && form.returned
      ? Math.ceil((new Date(form.returned) - new Date(form.pickup)) / 86400000)
      : 0;
  const extrasTotal = extras
    .filter((item) => selectedExtras.includes(item.id))
    .reduce(
      (total, item) => total + Number(item.price_per_day) * Math.max(duration, 0) + Number(item.flat_price),
      0,
    );
  const valid = duration > 0 && new Date(form.pickup) > new Date();
  const contactComplete = Boolean(form.driver_name.trim() && form.phone.trim() && user?.email?.trim());
  const agencyOptions = locations.map((item) => ({ value: item.id, label: `${item.name} · ${item.city}` }));
  const validateBooking = () => {
    if (
      ![form.pickup, form.returned].every((value) =>
        /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value),
      )
    ) {
      return "Enter valid times from 00:00 to 23:59.";
    }
    if (!form.pickup_location || !form.dropoff_location) {
      return "Select pick-up and return agencies.";
    }
    if (!contactComplete) {
      return "Driver name, phone number and account email are required to book.";
    }
    if (!valid) {
      return "Choose a future pick-up time and a later return time.";
    }
    return "";
  };
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || reservation) return;
    const validationError = validateBooking();
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
          <div className="vehicle-booking-dates">
            {[
              ["pickup", "Pick-up", minimumPickup],
              ["returned", "Return", minimumReturn],
            ].map(([field, label, minimum]) => {
              const [date = "", time = ""] = form[field].split("T");
              return (
                <div className="vehicle-booking-date-group" key={field}>
                  <label>
                    {label} date
                    <input
                      type="date"
                      required
                      min={minimum.slice(0, 10)}
                      value={date}
                      onChange={(event) =>
                        change(field)({
                          target: {
                            value: event.target.value
                              ? `${event.target.value}T${time || minimum.slice(11)}`
                              : "",
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    {label} time
                    <input
                      type="time"
                      required
                      disabled={!date}
                      value={time}
                      min={date === minimum.slice(0, 10) ? minimum.slice(11) : undefined}
                      onChange={(event) => {
                        if (event.target.value)
                          change(field)({ target: { value: `${date}T${event.target.value}` } });
                        else setForm({ ...form, [field]: date });
                      }}
                    />
                  </label>
                </div>
              );
            })}
          </div>
          {user && (
            <>
              <div className="vehicle-booking-fields">
                <CompactDropdown
                  label="Pick-up agency"
                  value={form.pickup_location}
                  placeholder="Select an agency"
                  disabled={busy || loading}
                  onChange={(value) => change("pickup_location")({ target: { value } })}
                  options={agencyOptions}
                />
                <CompactDropdown
                  label="Return agency"
                  value={form.dropoff_location}
                  placeholder="Select an agency"
                  disabled={busy || loading}
                  onChange={(value) => change("dropoff_location")({ target: { value } })}
                  options={agencyOptions}
                />
                <label>
                  Driver name
                  <input
                    required
                    maxLength={100}
                    value={form.driver_name}
                    onChange={change("driver_name")}
                    autoComplete="name"
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={user.email || ""}
                    readOnly
                    autoComplete="email"
                    aria-label="Account email"
                  />
                </label>
                <label>
                  Phone
                  <input
                    required
                    type="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={change("phone")}
                    autoComplete="tel"
                  />
                </label>
              </div>
              {locationError && <p role="alert">Could not load agencies. Refresh to try again.</p>}
            </>
          )}
          {user && <BookingExtras extras={extras} selectedExtras={selectedExtras} loading={extrasLoading} error={extrasError} onChange={changeExtra} money={money} />}
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
            <Link
              className="vehicle-booking-button vehicle-booking-signin"
              to="/login"
              state={{ from: location }}
            >
              Sign in to book this car <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="submit"
              className="vehicle-booking-button"
              disabled={busy || loading || unavailable || !valid || !contactComplete || !locations.length || locationError}
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
