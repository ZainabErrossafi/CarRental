import { useI18n } from "../../../context/I18nContext";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function SocialSettingsFields({ settings, handleChange }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card settings-social-card">
      <h3>{t("Social Links")}</h3>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="facebook">
            <Facebook size={13} /> {t("Facebook")}
          </label>
          <input
            id="facebook"
            type="url"
            placeholder={t("https://facebook.com/...")}
            value={settings.facebook}
            onChange={(e) => handleChange("facebook", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="instagram">
            <Instagram size={13} /> {t("Instagram")}
          </label>
          <input
            id="instagram"
            type="url"
            placeholder={t("https://instagram.com/...")}
            value={settings.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="twitter">
            <Twitter size={13} /> {t("Twitter / X")}
          </label>
          <input
            id="twitter"
            type="url"
            placeholder={t("https://x.com/...")}
            value={settings.twitter}
            onChange={(e) => handleChange("twitter", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="linkedin">
            <Linkedin size={13} /> {t("LinkedIn")}
          </label>
          <input
            id="linkedin"
            type="url"
            placeholder={t("https://linkedin.com/...")}
            value={settings.linkedin}
            onChange={(e) => handleChange("linkedin", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
