import { useI18n } from "../../../context/I18nContext";
import SearchableSelect from "../../SearchableSelect";

export default function VehicleIdentityFields({ form, onChange, catalog }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-identity-card">
      <div className="vehicle-identity-heading">
        <h3>{t("Vehicle identity")}</h3>
        <p>
          {t("Start with the details customers will use to find your vehicle.")}
        </p>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="brand">{t("Brand / Make")}</label>
          <SearchableSelect
            id="brand"
            value={form.brand_id}
            onChange={(value) => onChange("brand_id", value ?? "")}
            options={
              catalog?.brands.map((item) => ({
                value: item.id,
                label: item.name,
              })) ?? []
            }
            placeholder={t("Brands")}
            disablePortal
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="model">{t("Model")}</label>
          <input
            id="model"
            type="text"
            placeholder={t("e.g. Corolla")}
            value={form.model}
            onChange={(e) => onChange("model", e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="year">{t("Year")}</label>
          <input
            id="year"
            type="number"
            step="any"
            min="0"

            value={form.year}
            onChange={(e) => onChange("year", Number(e.target.value))}
            required
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="category">{t("Vehicle category")}</label>
          <SearchableSelect
            id="category"
            value={form.category_id}
            onChange={(value) => onChange("category_id", value ?? "")}
            options={
              catalog?.categories.map((item) => ({
                value: item.id,
                label: item.name,
              })) ?? []
            }
            placeholder={t("Categories")}
            disablePortal
            required
          />
          <span id="vehicle-category-hint" className="field-hint">
            {t(
              "Choose the category customers will browse to find this vehicle.",
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
