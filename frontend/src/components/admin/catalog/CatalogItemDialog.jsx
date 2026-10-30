import { useI18n } from "../../../context/I18nContext";
import { X } from "lucide-react";
import { CATALOG_ICONS as ICONS } from "../../CatalogIcons.jsx";
import { ICON_LABELS, CATEGORY_ICON_KEYS, slugify } from "./catalogConfig.js";

export default function CatalogItemDialog({
  editing,
  tab,
  meta,
  form,
  saving,
  error,
  closeModal,
  handleSave,
  setField,
  handleNameChange,
  setSlugTouched,
}) {
  const { t } = useI18n();
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-card modal-wide catalog-dialog vehicle-details-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <div className="modal-header">
            <div className="catalog-dialog-heading">
              <h3 id="catalog-dialog-title">
                {editing === "new"
                  ? t("Add {value0}", { value0: t(meta.singular) })
                  : t("Edit {value0}", { value0: t(meta.singular) })}
              </h3>
              <p>
                {t(
                  "Organize your fleet catalog with clear, consistent details.",
                )}
              </p>
            </div>
            <button
              type="button"
              className="modal-close"
              aria-label={t("Close dialog")}
              onClick={closeModal}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body catalog-dialog-body">
            {error && (
              <div role="alert" className="alert alert-error">
                {t(error)}
              </div>
            )}
            {tab !== "brands" && (
              <div className="form-field">
                <span className="catalog-field-label" id="catalog-icon-label">
                  {t("Choose an icon")}
                </span>
                <div
                  className="icon-picker"
                  role="group"
                  aria-labelledby="catalog-icon-label"
                >
                  {Object.entries(ICONS)
                    .filter(
                      ([key]) =>
                        tab !== "categories" ||
                        CATEGORY_ICON_KEYS.includes(key),
                    )
                    .map(([key, Icon]) => (
                      <button
                        type="button"
                        key={key}
                        title={t(ICON_LABELS[key])}
                        aria-label={t(ICON_LABELS[key])}
                        aria-pressed={form.icon === key}
                        className={form.icon === key ? "selected" : ""}
                        onClick={() => setField("icon", key)}
                      >
                        <Icon size={18} />
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="c_name">{t("Name")}</label>
              <input
                id="c_name"
                placeholder={
                  tab === "brands"
                    ? t("e.g. Toyota")
                    : tab === "categories"
                      ? t("e.g. Economy")
                      : tab === "extras"
                        ? t("e.g. Child seat")
                        : t("e.g. Bluetooth")
                }
                autoFocus
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            {tab === "brands" && (
              <div className="form-field">
                <label htmlFor="c_slug">{t("Slug")}</label>
                <input
                  id="c_slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setField("slug", slugify(e.target.value));
                  }}
                  required
                />
                <span className="field-hint">
                  {t("URL-friendly name, e.g.")} {form.slug || t("toyota")}
                </span>
              </div>
            )}

            {tab === "extras" && (
              <div className="form-grid catalog-pricing-grid">
                <div className="form-field">
                  <label htmlFor="c_ppd">{t("Price per day")}</label>
                  <div className="input-group">
                    <input
                      id="c_ppd"
                      type="number"
                      min="0"
                      step="5"
                      value={form.price_per_day}
                      onChange={(e) =>
                        setField("price_per_day", Number(e.target.value))
                      }
                    />
                    <span className="input-suffix">{t("MAD/day")}</span>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="c_flat">{t("Flat price")}</label>
                  <div className="input-group">
                    <input
                      id="c_flat"
                      type="number"
                      min="0"
                      step="5"
                      value={form.flat_price}
                      onChange={(e) =>
                        setField("flat_price", Number(e.target.value))
                      }
                    />
                    <span className="input-suffix">{t("MAD")}</span>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="c_max">{t("Max quantity")}</label>
                  <input
                    id="c_max"
                    type="number"
                    min="1"
                    value={form.max_qty}
                    onChange={(e) =>
                      setField("max_qty", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            )}

            {(tab === "categories" || tab === "extras") && (
              <label className="vehicle-featured-control">
                <span className="vehicle-featured-copy">
                  <span className="vehicle-featured-title">{t("Active")}</span>
                  <span className="field-hint">{t("Active")}</span>
                </span>
                <input
                  className="vehicle-featured-input"
                  type="checkbox"
                  role="switch"
                  checked={!!form.active}
                  onChange={(e) => setField("active", e.target.checked)}
                />
                <span className="vehicle-featured-switch" aria-hidden="true" />
              </label>
            )}
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
                : editing === "new"
                  ? t("Add {value0}", { value0: t(meta.singular) })
                  : t("Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
