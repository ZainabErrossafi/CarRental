import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVehicles, createReservation } from "../../services/adminApi";

const EMPTY_RESERVATION = {
  vehicle_id: "",
  driver_name: "",
  phone: "",
  email: "",
  pickup_date: "",
  return_date: "",
};

export default function AdminReservationAdd() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(EMPTY_RESERVATION);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVehicles().then((data) =>
      setVehicles(data.filter((v) => v.status === "available"))
    );
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedVehicle = vehicles.find((v) => v.id === Number(form.vehicle_id));

  const estimatedDays = (() => {
    if (!form.pickup_date || !form.return_date) return 0;
    const start = new Date(form.pickup_date);
    const end = new Date(form.return_date);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const estimatedTotal = selectedVehicle ? estimatedDays * selectedVehicle.dailyRate : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.vehicle_id) {
      setError("Please select a vehicle.");
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
      await createReservation(form);
      navigate("/admin/reservations");
    } catch (err) {
      setError(err.message || "Failed to create reservation. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="admin-edit-container">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/admin/reservations")}>
            ← Back to Reservations
          </button>
          <h1>New Reservation</h1>
          <p className="subtitle">Book a vehicle on behalf of a client</p>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">

          {/* Vehicle & Dates */}
          <div className="form-card">
            <h3>Vehicle & Dates</h3>
            <div className="form-grid">
              <div className="form-field full-width">
                <label htmlFor="vehicle_id">Vehicle</label>
                <select
                  id="vehicle_id"
                  className="select-lg"
                  value={form.vehicle_id}
                  onChange={(e) => handleChange("vehicle_id", e.target.value)}
                  required
                >
                  <option value="" disabled>Select an available vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} — {v.dailyRate} MAD/day
                    </option>
                  ))}
                </select>
                {vehicles.length === 0 && (
                  <span className="field-hint">No available vehicles right now.</span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="pickup_date">Pickup Date</label>
                <input
                  id="pickup_date"
                  type="date"
                  value={form.pickup_date}
                  onChange={(e) => handleChange("pickup_date", e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="return_date">Return Date</label>
                <input
                  id="return_date"
                  type="date"
                  value={form.return_date}
                  onChange={(e) => handleChange("return_date", e.target.value)}
                  required
                />
              </div>

              {estimatedDays > 0 && selectedVehicle && (
                <div className="form-field full-width">
                  <div className="estimate-box">
                    <span>{estimatedDays} day{estimatedDays > 1 ? "s" : ""} × {selectedVehicle.dailyRate} MAD</span>
                    <strong>{estimatedTotal} MAD estimated total</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver Details */}
          <div className="form-card">
            <h3>Driver Details</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="driver_name">Driver Name</label>
                <input
                  id="driver_name"
                  type="text"
                  value={form.driver_name}
                  onChange={(e) => handleChange("driver_name", e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+212 6 00 00 00 00"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/reservations")}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Creating..." : "Create Reservation"}
          </button>
        </div>
      </form>
    </div>
  );
}