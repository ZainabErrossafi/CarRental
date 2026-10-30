import { useI18n } from "../../context/I18nContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVehicle } from "../../services/adminApi";
import VehicleForm, { EMPTY_VEHICLE } from "../../components/admin/vehicles/VehicleForm";

export default function AdminVehicleAdd() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_VEHICLE);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setUploadProgress(null);
    setError(null);

    try {
      await createVehicle(form, (event) => {
        if (event.total > 0) {
          setUploadProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        }
      });
      navigate("/admin/vehicles");
    } catch (err) {
      setError(err.message || "Failed to create vehicle. Please try again.");
      setSaving(false);
      setUploadProgress(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="admin-edit-container">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/admin/vehicles")}>
            {t("← Back to Fleet List")}
          </button>
          <h1>{t("Add Vehicle")}</h1>
          <p className="subtitle">{t("Create a new vehicle listing")}</p>
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">⚠️ {t(error)}</div>}

      <VehicleForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/admin/vehicles")}
        saving={saving}
        uploadProgress={uploadProgress}
        submitLabel={t("Create Vehicle")}
        savingLabel={t("Creating...")}
        multiStep
      />
    </div>
  );
}