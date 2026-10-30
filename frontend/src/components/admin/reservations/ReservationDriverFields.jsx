import { useI18n } from "../../../context/I18nContext";

export default function ReservationDriverFields({ form, handleChange }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card">
      <div className="vehicle-identity-heading">
        <h3>{t("Driver details")}</h3>
        <p>
          {t("Add the contact details for the person driving the vehicle.")}
        </p>
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="driver_name">{t("Driver Name")}</label>
          <input
            id="driver_name"
            type="text"
            value={form.driver_name}
            onChange={(e) => handleChange("driver_name", e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone">{t("Phone")}</label>
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
          <label htmlFor="email">{t("Email")}</label>
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
  );
}
