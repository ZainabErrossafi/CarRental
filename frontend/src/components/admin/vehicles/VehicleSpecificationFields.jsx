import { useI18n } from "../../../context/I18nContext";
import SearchableSelect from "../../SearchableSelect";

export default function VehicleSpecificationFields({ form, onChange }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card vehicle-specs-card">
      <div className="vehicle-identity-heading">
        <h3>{t("Vehicle specifications")}</h3>
        <p>{t("Add the practical details customers need before booking.")}</p>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="transmission">{t("Transmission")}</label>
          <SearchableSelect
            id="transmission"
            value={form.transmission}
            onChange={(value) => onChange("transmission", value ?? "")}
            options={[
              { value: "manual", label: t("Manual") },
              { value: "automatic", label: t("Automatic") },
            ]}
            placeholder={t("Transmission")}
            disablePortal
          />
        </div>

        <div className="form-field">
          <label htmlFor="fuel">{t("Fuel Type")}</label>
          <SearchableSelect
            id="fuel"
            value={form.fuel}
            onChange={(value) => onChange("fuel", value ?? "")}
            options={[
              { value: "diesel", label: t("Diesel") },
              { value: "petrol", label: t("Gasoline (Essence)") },
              { value: "hybrid", label: t("Hybrid") },
              { value: "electric", label: t("Electric") },
            ]}
            placeholder={t("Fuel Type")}
            disablePortal
          />
        </div>

        <div className="form-field">
          <label htmlFor="seats">{t("Seats")}</label>
          <input
            id="seats"
            type="number"
            step="any"
            min="0"

            value={form.seats}
            onChange={(e) => onChange("seats", Number(e.target.value))}
          />
        </div>

        <div className="form-field">
          <label htmlFor="doors">{t("Doors")}</label>
          <input
            id="doors"
            type="number"
            step="any"
            min="0"

            value={form.doors}
            onChange={(e) => onChange("doors", Number(e.target.value))}
          />
        </div>

        <div className="form-field">
          <label htmlFor="luggage">{t("Luggage Capacity")}</label>
          <input
            id="luggage"
            type="number"
            step="any"
            min="0"
            value={form.luggage}
            onChange={(e) => onChange("luggage", Number(e.target.value))}
          />
          <span className="field-hint">
            {t("Number of standard suitcases it fits.")}
          </span>
        </div>

        <label className="vehicle-featured-control full-width">
          <span className="vehicle-featured-copy">
            <span className="vehicle-featured-title">
              {t("Air conditioning")}
            </span>
            <span className="field-hint" id="vehicle-ac-hint">
              {t("Keep passengers comfortable on warm days.")}
            </span>
          </span>
          <input
            className="vehicle-featured-input"
            type="checkbox"
            role="switch"
            aria-describedby="vehicle-ac-hint"
            checked={!!form.air_conditioning}
            onChange={(e) => onChange("air_conditioning", e.target.checked)}
          />
          <span className="vehicle-featured-switch" aria-hidden="true" />
        </label>
      </div>
    </div>
  );
}
