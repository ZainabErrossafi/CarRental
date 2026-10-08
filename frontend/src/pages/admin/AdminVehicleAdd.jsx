import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVehicle } from "../../services/adminApi";
import VehicleForm, { EMPTY_VEHICLE } from "./VehicleForm";

export default function AdminVehicleAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_VEHICLE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createVehicle(form);
      navigate("/admin/vehicles");
    } catch (err) {
      setError(err.message || "Failed to create vehicle. Please try again.");
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="admin-edit-container">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/admin/vehicles")}>
            ← Back to Fleet List
          </button>
          <h1>Add Vehicle</h1>
          <p className="subtitle">Create a new vehicle listing</p>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

      <VehicleForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/vehicles")}
        saving={saving}
        submitLabel="Create Vehicle"
        savingLabel="Creating..."
        multiStep
      />
    </div>
  );
}