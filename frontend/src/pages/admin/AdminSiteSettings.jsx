import UploadProgress from "../../components/UploadProgress";
import useImageReader from "../../hooks/useImageReader";
import { useI18n } from "../../context/I18nContext";
import { useEffect, useRef, useState } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ImagePlus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "../../services/adminApi";

const STEPS = ["Company & Social", "Homepage & About"];

export default function AdminSiteSettings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [step, setStep] = useState(0);
  const formRef = useRef(null);
  const { readImage, progress: imageProgress } = useImageReader(
    (image) => handleChange("hero_image", image), setImageError,
  );

  const isLastStep = step === STEPS.length - 1;

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const handleChange = (field, value) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image is too large. Please choose a file under 5MB.");
      return;
    }
    setImageError(null);
    readImage(file);
  };

  const goNext = () => {
    // validate the fields visible on the current step before moving on
    if (formRef.current && !formRef.current.reportValidity()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || imageProgress !== null) return;

    // Pressing Enter on step 1 should go to the next step, not save
    if (!isLastStep) {
      goNext();
      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await updateSiteSettings(settings);
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <p>{t("Loading...")}</p>;

  return (
    <div className="admin-edit-container site-settings-page">
      <div className="page-header">
        <div>
          <h1>{t("Site Settings")}</h1>
          <p className="subtitle">
            {t("Manage company details, social links, and homepage content.")}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`step-item ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
          >
            <span className="step-number">{i < step ? "✓" : i + 1}</span>
            <span className="step-label">{t(label)}</span>
          </div>
        ))}
      </div>

      <p className="local-editor-note">
        {t("Changes are saved in this browser only and do not update the public site.")}
      </p>
      {error && <div role="alert" className="alert alert-error mb-4">{t(error)}</div>}
      {saved && (
        <div className="alert alert-success mb-4">{t("✓ Settings saved in this browser.")}</div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">

          {/* ================= STEP 1 ================= */}
          {step === 0 && (
            <>
              {/* Company Info */}
              <div className="form-card vehicle-details-card">
                <h3>{t("Company Information")}</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="company_name">{t("Company Name")}</label>
                    <input
                      id="company_name"
                      type="text"
                      value={settings.company_name}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                      required
                    />
                  </div>

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

              {/* Social Links */}
              <div className="form-card vehicle-details-card settings-social-card">
                <h3>{t("Social Links")}</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="facebook"><Facebook size={13} /> {t("Facebook")}</label>
                    <input
                      id="facebook"
                      type="url"
                      placeholder={t("https://facebook.com/...")}
                      value={settings.facebook}
                      onChange={(e) => handleChange("facebook", e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="instagram"><Instagram size={13} /> {t("Instagram")}</label>
                    <input
                      id="instagram"
                      type="url"
                      placeholder={t("https://instagram.com/...")}
                      value={settings.instagram}
                      onChange={(e) => handleChange("instagram", e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="twitter"><Twitter size={13} /> {t("Twitter / X")}</label>
                    <input
                      id="twitter"
                      type="url"
                      placeholder={t("https://x.com/...")}
                      value={settings.twitter}
                      onChange={(e) => handleChange("twitter", e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="linkedin"><Linkedin size={13} /> {t("LinkedIn")}</label>
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
            </>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 1 && (
            <>
              {/* Hero Section */}
              <div className="form-card vehicle-details-card vehicle-media-card settings-hero-card">
                <h3>{t("Homepage Hero")}</h3>

                <div className="form-field full-width">
                  <label htmlFor="hero_image_file">{t("Hero image")}</label>
                  <div className="image-upload">
                    {settings.hero_image ? (
                      <div className="image-upload-preview">
                        <img
                          src={settings.hero_image}
                          alt={t("Hero preview")}
                          className="image-preview"
                        />
                        <button
                          type="button"
                          className="image-upload-remove"
                          disabled={saving || imageProgress !== null}
                          onClick={() => handleChange("hero_image", "")}
                        >
                          <X size={14} />
                          {t("Remove")}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="image-upload-dropzone"
                        disabled={saving || imageProgress !== null}
                        onClick={() => document.getElementById("hero_image_file").click()}
                      >
                        <ImagePlus size={22} />
                        <span className="settings-hero-upload-copy">
                          <span className="vehicle-upload-title">{t("Choose a hero image")}</span>
                          <span className="field-hint">{t("PNG, JPG or WEBP — up to 5MB")}</span>
                        </span>
                        <span className="settings-hero-upload-action">{t("Browse files")}</span>
                      </button>
                    )}
                    {imageError && <div className="alert alert-error" role="alert">{t(imageError)}</div>}
                    {imageProgress !== null && <UploadProgress value={imageProgress} label="Reading image…" />}
                    <input
                      id="hero_image_file"
                      type="file"
                      disabled={saving || imageProgress !== null}
                      accept="image/png, image/jpeg, image/webp"
                      className="image-upload-input"
                      onChange={(e) => {
                        handleImageUpload(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="hero_title_en">{t("Hero title")}</label>
                    <input
                      id="hero_title_en"
                      type="text"
                      value={settings.hero_title_en}
                      onChange={(e) => handleChange("hero_title_en", e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="hero_subtitle_en">{t("Hero subtitle")}</label>
                    <input
                      id="hero_subtitle_en"
                      type="text"
                      value={settings.hero_subtitle_en}
                      onChange={(e) => handleChange("hero_subtitle_en", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* About */}
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
            </>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions step-actions">
          {step > 0 && (
            <button type="button" className="btn btn-secondary" onClick={goBack}>
              <ChevronLeft size={16} /> {t("Back")}
            </button>
          )}

          {!isLastStep ? (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {t("Next")} <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={saving || imageProgress !== null}>
              {saving ? t("Saving...") : t("Save Changes")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}