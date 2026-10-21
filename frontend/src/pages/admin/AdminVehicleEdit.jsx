import { useI18n } from "../../context/I18nContext";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicle, updateVehicle } from "../../services/adminApi";
import VehicleForm from "./VehicleForm";

export default function AdminVehicleEdit() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getVehicle(id)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setError("Vehicle not found.");
        } else {
          setForm(data);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load vehicle details.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setUploadProgress(null);
    setSaving(true);
    setError(null);

    try {
      await updateVehicle(id, form, (event) => {
        if (event.total > 0) setUploadProgress(Math.min(100, Math.round(event.loaded / event.total * 100)));
      });
      navigate("/admin/vehicles");
    } catch (err) {
      setError(err.message || "Failed to save changes. Please try again.");
      setSaving(false);
      setUploadProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-edit-container flex-center">
        <div className="spinner"></div>
        <p style={{ marginTop: "1rem", color: "#64748b" }}>{t("Loading vehicle details...")}</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="admin-edit-container">
        <div className="alert alert-error">
          <span>⚠️ {t(error)}</span>
          <button className="btn btn-secondary" onClick={() => navigate("/admin/vehicles")}>
            {t("Back to Vehicles")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-edit-container">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate("/admin/vehicles")}>
            {t("← Back to Fleet List")}
          </button>
          <h1>{t("Edit Vehicle")}</h1>
          <p className="subtitle">
            {form?.brand} {form?.model} ({form?.year})
          </p>
        </div>
        <div className="header-badges">
          <span className="category-badge">{t(form?.category || "Economy")}</span>
          <span className={`status-badge status-${form?.status?.toLowerCase() || "available"}`}>
            {t(form?.status || "Available")}
          </span>
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
        uploadCompleteLabel="Saving Changes..."
        submitLabel={t("Save Changes")}
        savingLabel={t("Saving Changes...")}
      />
    </div>
  );
}