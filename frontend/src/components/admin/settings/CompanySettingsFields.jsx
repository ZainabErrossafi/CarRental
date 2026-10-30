import { useI18n } from "../../../context/I18nContext";

export default function CompanySettingsFields({ settings, handleChange }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card">
      <h3>{t("Company Information")}</h3>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="email">{t("Email")}</label>
          <input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone">{t("Phone")}</label>
          <input
            id="phone"
            type="tel"
            value={settings.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="whatsapp">{t("WhatsApp")}</label>
          <input
            id="whatsapp"
            type="tel"
            value={settings.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
          />
        </div>

        <div className="form-field settings-address-field">
          <label htmlFor="address">{t("Address")}</label>
          <input
            id="address"
            type="text"
            value={settings.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="city">{t("City")}</label>
          <input
            id="city"
            type="text"
            value={settings.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="country">{t("Country")}</label>
          <input
            id="country"
            type="text"
            value={settings.country}
            onChange={(e) => handleChange("country", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
