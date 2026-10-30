import { useI18n } from "../../../context/I18nContext";
import { X } from "lucide-react";

export default function LocationFormDialog({
  closeModal,
  handleSave,
  isNew,
  form,
  setForm,
  saving,
}) {
  const { t } = useI18n();
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-card modal-wide catalog-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <div className="modal-header">
            <div className="catalog-dialog-heading">
              <h3>{isNew ? t("Add Location") : t("Edit Location")}</h3>
              <p>
                {t(
                  "Set up a pickup or dropoff point customers can choose when booking.",
                )}
              </p>
            </div>
            <button
              type="button"
              className="modal-close"
              onClick={closeModal}
              aria-label={t("Close")}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body catalog-dialog-body">
            <div className="form-field">
              <label className="catalog-field-label" htmlFor="loc_name">
                {t("Name")}
              </label>
              <input
                id="loc_name"
                type="text"
                placeholder={t("e.g. Rabat Agdal")}
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                autoFocus
                required
              />
            </div>

            <div className="form-field">
              <label className="catalog-field-label" htmlFor="loc_city">
                {t("City")}
              </label>
              <input
                id="loc_city"
                type="text"
                placeholder={t("e.g. Rabat")}
                value={form.city}
                onChange={(e) =>
                  setForm((p) => ({ ...p, city: e.target.value }))
                }
                required
              />
            </div>

            <div className="form-field">
              <label className="catalog-field-label" htmlFor="loc_country">
                {t("Country")}
              </label>
              <input
                id="loc_country"
                type="text"
                value={form.country}
                onChange={(e) =>
                  setForm((p) => ({ ...p, country: e.target.value }))
                }
                required
              />
            </div>

            <label className="vehicle-featured-control">
              <span className="vehicle-featured-copy">
                <span className="vehicle-featured-title">{t("Active")}</span>
                <span className="field-hint">
                  {" "}
                  {t("Available as a pickup and dropoff point.")}
                </span>
              </span>
              <input
                className="vehicle-featured-input"
                type="checkbox"
                role="switch"
                checked={!!form.active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, active: e.target.checked }))
                }
              />
              <span className="vehicle-featured-switch" aria-hidden="true" />
            </label>
          </div>

          <div className="modal-footer" style={{ gap: "0.6rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={saving}
            >
              {t("Cancel")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? t("Saving...")
                : isNew
                  ? t("Add Location")
                  : t("Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
