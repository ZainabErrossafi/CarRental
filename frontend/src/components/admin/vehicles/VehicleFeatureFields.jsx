import { useI18n } from "../../../context/I18nContext";

export default function VehicleFeatureFields({
  form,
  onChange,
  catalog,
  saving,
}) {
  const { t, lang } = useI18n();
  return (
    <div className="form-card vehicle-details-card">
      <div className="vehicle-identity-heading">
        <h3 id="vehicle-features-heading">{t("Features")}</h3>
        <p>{t("Select the equipment included with this vehicle.")}</p>
      </div>
      <div
        className="vehicle-features-grid"
        role="group"
        aria-labelledby="vehicle-features-heading"
      >
        {catalog?.features.map((feature) => (
          <label className="vehicle-feature-option" key={feature.id}>
            <input
              type="checkbox"
              disabled={saving}
              checked={(form.feature_ids ?? []).includes(feature.id)}
              onChange={(event) =>
                onChange(
                  "feature_ids",
                  event.target.checked
                    ? [...(form.feature_ids ?? []), feature.id]
                    : (form.feature_ids ?? []).filter(
                        (id) => id !== feature.id,
                      ),
                )
              }
            />
            <span>{feature[`name_${lang}`] || feature.name}</span>
          </label>
        ))}
      </div>
      {catalog && catalog.features.length === 0 && (
        <p className="field-hint">
          {t("No features available. Add features in Catalog first.")}
        </p>
      )}
    </div>
  );
}
