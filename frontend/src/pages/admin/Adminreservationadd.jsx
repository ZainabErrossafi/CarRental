import ReservationDriverFields from "../../components/admin/reservations/ReservationDriverFields.jsx";
import ReservationExtrasFields from "../../components/admin/reservations/ReservationExtrasFields.jsx";
import ReservationBookingFields from "../../components/admin/reservations/ReservationBookingFields.jsx";
import ReservationCustomerFields from "../../components/admin/reservations/ReservationCustomerFields.jsx";
import { currentReservationTime } from "../../utils/reservationTime";
import { useI18n } from "../../context/I18nContext";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getVehicles,
  getLocations,
  getUsers,
  getExtras,
  createReservation,
} from "../../services/adminApi";

const EMPTY_RESERVATION = {
  user_id: null, // Start without a selected user or guest option
  vehicle_id: "",
  pickup_location_id: "",
  dropoff_location_id: "",
  driver_name: "",
  phone: "",
  email: "",
  pickup_date: "",
  return_date: "",
  extras: [], // Array of selected extra IDs
};

export default function AdminReservationAdd() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [minimumTime, setMinimumTime] = useState(currentReservationTime);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableExtras, setAvailableExtras] = useState([]);

  // Form states
  const [form, setForm] = useState(EMPTY_RESERVATION);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    Promise.all([getVehicles(), getLocations(), getUsers(), getExtras()])
      .then(([vData, lData, uData, eData]) => {
        setVehicles(vData.filter((v) => v.status === "available"));
        setLocations(lData);
        setUsers(uData);
        setAvailableExtras(eData.filter((e) => e.active !== false)); // Assuming active flag
      })
      .catch((err) => {
        setError(err.message || "Could not load reservation options.");
      });
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "pickup_date" &&
      (!value || (prev.return_date && prev.return_date < value))
        ? { return_date: "" }
        : {}),
    }));
  };

  const handleExtraToggle = (extraId) => {
    setForm((prev) => {
      const currentExtras = prev.extras;
      if (currentExtras.includes(extraId)) {
        return {
          ...prev,
          extras: currentExtras.filter((id) => id !== extraId),
        };
      } else {
        return { ...prev, extras: [...currentExtras, extraId] };
      }
    });
  };

  // Calculations
  const selectedVehicle = vehicles.find(
    (v) => v.id === Number(form.vehicle_id),
  );

  const estimatedDays = (() => {
    if (!form.pickup_date || !form.return_date) return 0;
    const start = new Date(form.pickup_date);
    const end = new Date(form.return_date);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const estimatedTotal = (() => {
    if (!selectedVehicle || estimatedDays === 0) return 0;

    // Vehicle daily rate
    let total = estimatedDays * Number(selectedVehicle.dailyRate || 0);

    // Add Extras (accounting for flat price or per day price)
    form.extras.forEach((extraId) => {
      const extra = availableExtras.find((e) => e.id === Number(extraId));
      if (extra) {
        total += Number(extra.flat_price || 0);
        total += Number(extra.price_per_day || 0) * estimatedDays;
      }
    });

    return total;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (
      !form.vehicle_id ||
      !form.pickup_location_id ||
      !form.dropoff_location_id
    ) {
      setError("Please select a vehicle and both pickup/dropoff locations.");
      return;
    }
    if (!form.pickup_date || !form.return_date) {
      setError("Please set both pickup and return dates.");
      return;
    }
    if (new Date(form.return_date) <= new Date(form.pickup_date)) {
      setError("Return date must be after the pickup date.");
      return;
    }

    setSaving(true);
    try {
      // Append calculated total_price to the submission payload
      const payload = {
        ...form,
        pickup_date: new Date(form.pickup_date).toISOString(),
        return_date: new Date(form.return_date).toISOString(),
        user_id: form.user_id ?? "",
        total_price: estimatedTotal.toFixed(2),
      };

      await createReservation(payload);
      navigate("/admin/reservations");
    } catch (err) {
      setError(
        err.message || "Failed to create reservation. Please try again.",
      );
      setSaving(false);
    }
  };

  return (
    <div className="admin-edit-container">
      <div className="page-header">
        <div>
          <button
            className="btn-back"
            onClick={() => navigate("/admin/reservations")}
          >
            {t("← Back to Reservations")}
          </button>
          <h1>{t("New Reservation")}</h1>
          <p className="subtitle">
            {t("Book a vehicle on behalf of a client")}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">⚠️ {t(error)}</div>}

      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">
          {/* User Details */}
          <ReservationCustomerFields
            form={form}
            handleChange={handleChange}
            users={users}
          />

          {/* Vehicle & Dates */}
          <ReservationBookingFields
            form={form}
            handleChange={handleChange}
            vehicles={vehicles}
            locations={locations}
            minimumTime={minimumTime}
            setMinimumTime={setMinimumTime}
          />

          {/* Extras */}
          <ReservationExtrasFields
            form={form}
            availableExtras={availableExtras}
            handleExtraToggle={handleExtraToggle}
          />

          {/* Pricing Summary */}
          {estimatedDays > 0 && selectedVehicle && (
            <div className="form-card vehicle-details-card">
              <div className="form-field full-width">
                <div className="estimate-box">
                  <span>
                    {t("Reservation for {count} days", {
                      count: estimatedDays,
                    })}
                  </span>
                  <strong>
                    {estimatedTotal.toFixed(2)} {t("MAD total")}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <ReservationDriverFields form={form} handleChange={handleChange} />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/reservations")}
            disabled={saving}
          >
            {t("Cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t("Creating...") : t("Create Reservation")}
          </button>
        </div>
      </form>
    </div>
  );
}
