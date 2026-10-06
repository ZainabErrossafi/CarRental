import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getVehicles, 
  getLocations, 
  getUsers, 
  getExtras, 
  createReservation 
} from "../../services/adminApi";

const EMPTY_RESERVATION = {
  user_id: "", // Optional, if booking for a registered user
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
  const navigate = useNavigate();
  
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
    Promise.all([
      getVehicles(),
      getLocations(),
      getUsers(),
      getExtras()
    ]).then(([vData, lData, uData, eData]) => {
      setVehicles(vData.filter((v) => v.status === "available"));
      setLocations(lData);
      setUsers(uData);
      setAvailableExtras(eData.filter((e) => e.active !== false)); // Assuming active flag
    }).catch(err => {
      setError(err.message || "Could not load reservation options.");
    });
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleExtraToggle = (extraId) => {
    setForm((prev) => {
      const currentExtras = prev.extras;
      if (currentExtras.includes(extraId)) {
        return { ...prev, extras: currentExtras.filter(id => id !== extraId) };
      } else {
        return { ...prev, extras: [...currentExtras, extraId] };
      }
    });
  };

  // Calculations
  const selectedVehicle = vehicles.find((v) => v.id === Number(form.vehicle_id));

  const estimatedDays = (() => {
    if (!form.pickup_date || !form.return_date) return 0;
    const start = new Date(form.pickup_date);
    const end = new Date(form.return_date);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const estimatedTotal = (() => {
    if (!selectedVehicle || estimatedDays === 0) return 0;
    
    // Vehicle daily rate
    let total = estimatedDays * Number(selectedVehicle.dailyRate || 0);
    
    // Add Extras (accounting for flat price or per day price)
    form.extras.forEach(extraId => {
      const extra = availableExtras.find(e => e.id === Number(extraId));
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
    if (!form.vehicle_id || !form.pickup_location_id || !form.dropoff_location_id) {
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
        total_price: estimatedTotal
      };
      
      await createReservation(payload);
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

          {/* User Details */}
          <div className="form-card vehicle-details-card">
            <div className="vehicle-identity-heading"><h3>Customer</h3><p>Select an existing customer or enter guest details below.</p></div>
            <div className="form-grid">
              <div className="form-field full-width">
                <label htmlFor="user_id">Registered User</label>
                <select
                  id="user_id"
                  value={form.user_id}
                  onChange={(e) => handleChange("user_id", e.target.value)}
                >
                  <option value="">Guest (No Account)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle & Dates */}
          <div className="form-card vehicle-details-card">
            <div className="vehicle-identity-heading"><h3>Reservation details</h3><p>Choose a vehicle, locations, and rental dates.</p></div>
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
              </div>

              <div className="form-field">
                <label htmlFor="pickup_location_id">Pickup Location</label>
                <select
                  id="pickup_location_id"
                  value={form.pickup_location_id}
                  onChange={(e) => handleChange("pickup_location_id", e.target.value)}
                  required
                >
                  <option value="" disabled>Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} - {loc.city}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="dropoff_location_id">Dropoff Location</label>
                <select
                  id="dropoff_location_id"
                  value={form.dropoff_location_id}
                  onChange={(e) => handleChange("dropoff_location_id", e.target.value)}
                  required
                >
                  <option value="" disabled>Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} - {loc.city}</option>
                  ))}
                </select>
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

            </div>
          </div>

          {/* Extras */}
          {availableExtras.length > 0 && (
            <div className="form-card vehicle-details-card">
              <h3>Extras & Add-ons</h3>
              <div className="form-grid">
                {availableExtras.map((extra) => (
                  <div key={extra.id} className="reservation-extra-option">
                    <label>
                      <input
                        type="checkbox"
                        checked={form.extras.includes(extra.id)}
                        onChange={() => handleExtraToggle(extra.id)}
                      />
                      {extra.name} 
                      ({extra.price_per_day ? `${extra.price_per_day} MAD/day` : `${extra.flat_price} MAD flat`})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          {estimatedDays > 0 && selectedVehicle && (
            <div className="form-card vehicle-details-card">
               <div className="form-field full-width">
                  <div className="estimate-box">
                    <span>{estimatedDays} day{estimatedDays > 1 ? "s" : ""} reservation</span>
                    <strong>{estimatedTotal} MAD total</strong>
                  </div>
                </div>
            </div>
          )}

          {/* Driver Details */}
          <div className="form-card vehicle-details-card">
            <div className="vehicle-identity-heading"><h3>Driver details</h3><p>Add the contact details for the person driving the vehicle.</p></div>
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