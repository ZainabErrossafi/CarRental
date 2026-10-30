import { useI18n } from "../../../context/I18nContext";

export default function AboutSettingsFields({ settings, handleChange }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card settings-about-card">
      <h3>{t("About Section")}</h3>
      <label className="settings-about-label" htmlFor="company-about">
        {t("About your company")}
      </label>
      <textarea
        id="company-about"
        className="vehicle-description-input"
        rows={5}
        placeholder={t("Tell customers about your company and rental service…")}
        value={settings.about_en}
        onChange={(e) => handleChange("about_en", e.target.value)}
      />
    </div>
  );
}
