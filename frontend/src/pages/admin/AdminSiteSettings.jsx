import AboutSettingsFields from "../../components/admin/settings/AboutSettingsFields.jsx";
import SocialSettingsFields from "../../components/admin/settings/SocialSettingsFields.jsx";
import CompanySettingsFields from "../../components/admin/settings/CompanySettingsFields.jsx";
import { useI18n } from "../../context/I18nContext";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "../../services/adminApi";

const STEPS = ["Company & Social", "About Section"];

export default function AdminSiteSettings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const formRef = useRef(null);
  const isLastStep = step === STEPS.length - 1;

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const handleChange = (field, value) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {

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
    if (saving) return;

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
            {t("Manage company details, social links, and about content.")}
          </p>
        </div>
      </div>

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
        {t(
          "Company details appear in the website footer in this browser. Settings are stored locally and are not published to other visitors.",
        )}
      </p>
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          {t(error)}
        </div>
      )}
      {saved && (
        <div className="alert alert-success mb-4">
          {t("✓ Settings saved in this browser.")}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">

          {step === 0 && (
            <>

              <CompanySettingsFields
                settings={settings}
                handleChange={handleChange}
              />

              <SocialSettingsFields
                settings={settings}
                handleChange={handleChange}
              />
            </>
          )}

          {step === 1 && (
            <>

              <AboutSettingsFields
                settings={settings}
                handleChange={handleChange}
              />
            </>
          )}
        </div>

        <div className="form-actions step-actions">
          {step > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goBack}
            >
              <ChevronLeft size={16} /> {t("Back")}
            </button>
          )}

          {!isLastStep ? (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {t("Next")} <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t("Saving...") : t("Save Changes")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
