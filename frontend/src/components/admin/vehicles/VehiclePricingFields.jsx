import { useI18n } from "../../../context/I18nContext";

export default function VehiclePricingFields({ form, onChange }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card vehicle-pricing-card">
      <div className="vehicle-identity-heading">
        <h3>{t("Pricing & rental rules")}</h3>
        <p>{t("Set your daily price, deposit, and driver requirements.")}</p>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="dailyRate">{t("Daily Rate")}</label>
          <div className="input-group">
            <input
              id="dailyRate"
              placeholder={t("e.g. 350")}
              type="number"
              step="any"
              min="0"

              value={form.dailyRate}
              onChange={(e) => onChange("dailyRate", Number(e.target.value))}
              required
            />
            <span className="input-suffix">{t("MAD/day")}</span>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="deposit">{t("Security Deposit")}</label>
          <div className="input-group">
            <input
              id="deposit"
              placeholder={t("e.g. 2000")}
              type="number"
              step="any"
              min="0"

              value={form.deposit}
              onChange={(e) => onChange("deposit", Number(e.target.value))}
            />
            <span className="input-suffix">{t("MAD")}</span>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="daily_mileage_limit">
            {t("Daily Mileage Limit")}
          </label>
          <div className="input-group">
            <input
              id="daily_mileage_limit"
              type="number"
              step="any"
              min="0"

              value={form.daily_mileage_limit}
              onChange={(e) =>
                onChange("daily_mileage_limit", Number(e.target.value))
              }
            />
            <span className="input-suffix">{t("km/day")}</span>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="min_driver_age">{t("Minimum Driver Age")}</label>
          <div className="input-group">
            <input
              id="min_driver_age"
              type="number"
              step="any"
              min="0"

              value={form.min_driver_age}
              onChange={(e) =>
                onChange("min_driver_age", Number(e.target.value))
              }
            />
            <span className="input-suffix">{t("years")}</span>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="min_license_years">{t("Minimum License Held")}</label>
          <div className="input-group">
            <input
              id="min_license_years"
              type="number"
              step="any"
              min="0"

              value={form.min_license_years}
              onChange={(e) =>
                onChange("min_license_years", Number(e.target.value))
              }
            />
            <span className="input-suffix">{t("years")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
