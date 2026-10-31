import ReservationDriverFields from "../../components/admin/reservations/ReservationDriverFields.jsx";
import ReservationExtrasFields from "../../components/admin/reservations/ReservationExtrasFields.jsx";
import ReservationBookingFields from "../../components/admin/reservations/ReservationBookingFields.jsx";
import ReservationCustomerFields from "../../components/admin/reservations/ReservationCustomerFields.jsx";
import { currentReservationTime } from "../../utils/reservationTime";
import { useI18n } from "../../context/I18nContext";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVehicles,
  getLocations,
  getUsers,
  getExtras,
  createReservation,
  getReservation,
  getReservationExtras,
  updateReservation,
} from "../../services/adminApi";

const EMPTY_RESERVATION = {
  user_id: null,
  vehicle_id: "",
  pickup_location_id: "",
  dropoff_location_id: "",
  driver_name: "",
  phone: "",
  email: "",
  pickup_date: "",
  return_date: "",
  extras: [],
};

export default function AdminReservationAdd() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState(null);
  const [extrasChanged, setExtrasChanged] = useState(false);
  const [minimumTime, setMinimumTime] = useState(currentReservationTime);

  const [vehicles, setVehicles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableExtras, setAvailableExtras] = useState([]);

  const [form, setForm] = useState(EMPTY_RESERVATION);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setOriginal(null);
    setForm(EMPTY_RESERVATION);
    setExtrasChanged(false);
    Promise.all([
      getVehicles(), getLocations(), getUsers(), getExtras(),
      isEditing ? getReservation(id) : null,
      isEditing ? getReservationExtras(id) : [],
    ])
      .then(([vData, lData, uData, eData, reservation, reservationExtras]) => {
        if (!active) return;
        if (reservation && !["pending", "confirmed"].includes(reservation.status)) {
          throw new Error("A cancelled or completed reservation cannot be modified.");
        }
        setVehicles(vData.filter((v) => v.status === "available" || v.id === reservation?.vehicle));
        setLocations(lData);
        setUsers(uData);
        setAvailableExtras(eData.filter((e) => e.active !== false));
        if (reservation) {
          const toLocal = (value) => {
            const date = new Date(value);
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          };
          const values = {
            user_id: reservation.user ?? null,
            vehicle_id: reservation.vehicle,
            pickup_location_id: reservation.pickup_location,
            dropoff_location_id: reservation.dropoff_location,
            driver_name: reservation.driver_name,
            phone: reservation.phone,
            email: reservation.email,
            pickup_date: toLocal(reservation.pickup_date),
            return_date: toLocal(reservation.return_date),
            extras: reservationExtras.map((item) => item.extra),
          };
          setForm(values);
          setOriginal({ ...reservation, form: values });
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load reservation options.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isEditing]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(!isEditing && field === "pickup_date" &&
      (!value || (prev.return_date && prev.return_date < value))
        ? { return_date: "" }
        : {}),
    }));
  };

  const handleExtraToggle = (extraId) => {
    setExtrasChanged(true);
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

    let total = estimatedDays * Number(selectedVehicle.dailyRate || 0);

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
    if (saving || loading || (isEditing && !original)) return;
    setError(null);

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

      const payload = {
        ...form,
        pickup_date: new Date(form.pickup_date).toISOString(),
        return_date: new Date(form.return_date).toISOString(),
        user_id: form.user_id ?? "",
        total_price: estimatedTotal.toFixed(2),
      };

      if (isEditing) {
        if (!extrasChanged) delete payload.extras;
        for (const field of ["pickup_date", "return_date"]) {
          if (form[field] === original.form[field]) payload[field] = original[field];
        }
        await updateReservation(id, payload);
      } else {
        await createReservation(payload);
      }
      navigate("/admin/reservations");
    } catch (err) {
      setError(
        err.message || "Failed to save reservation. Please try again.",
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
          <h1>{t(isEditing ? "Edit Reservation" : "New Reservation")}</h1>
          <p className="subtitle">
            {t(isEditing ? "Update reservation details" : "Book a vehicle on behalf of a client")}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">⚠️ {t(error)}</div>}

      {loading && <p role="status">{t("Loading...")}</p>}
      {!loading && (!isEditing || original) && <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">

          <ReservationCustomerFields
            form={form}
            handleChange={handleChange}
            users={users}
          />

          <ReservationBookingFields
            form={form}
            handleChange={handleChange}
            vehicles={vehicles}
            locations={locations}
            isEditing={isEditing}
            originalPickupDate={original?.form.pickup_date}
            minimumTime={minimumTime}
            setMinimumTime={setMinimumTime}
          />

          <ReservationExtrasFields
            form={form}
            availableExtras={availableExtras}
            handleExtraToggle={handleExtraToggle}
          />

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
            {saving ? t(isEditing ? "Saving..." : "Creating...") : t(isEditing ? "Save Changes" : "Create Reservation")}
          </button>
        </div>
      </form>}
    </div>
  );
}
