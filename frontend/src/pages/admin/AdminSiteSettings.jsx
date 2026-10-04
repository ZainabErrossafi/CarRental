import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ImagePlus,
  X,
} from "lucide-react";
import { getSiteSettings, updateSiteSettings } from "../../services/adminApi";

const LANGS = ["en", "fr", "ar"];
const LANG_LABEL = { en: "EN", fr: "FR", ar: "AR" };

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [heroTab, setHeroTab] = useState("en");
  const [aboutTab, setAboutTab] = useState("en");

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
      alert("Image is too large. Please choose a file under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleChange("hero_image", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateSiteSettings(settings);
      setSettings(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="admin-edit-container">
      <div className="page-header">
        <div>
          <h1>Site Settings</h1>
          <p className="subtitle">
            Company info shown across the site (footer, contact page, emails).
          </p>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success mb-4">✓ Settings saved successfully.</div>
      )}

      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">

          {/* Company Info */}
          <div className="form-card">
            <h3>Company Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="company_name">Company Name</label>
                <input
                  id="company_name"
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="whatsapp">WhatsApp</label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={settings.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={settings.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="country">Country</label>
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
          <div className="form-card">
            <h3>Social Links</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="facebook"><Facebook size={13} /> Facebook</label>
                <input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={settings.facebook}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="instagram"><Instagram size={13} /> Instagram</label>
                <input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={settings.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="twitter"><Twitter size={13} /> Twitter / X</label>
                <input
                  id="twitter"
                  type="url"
                  placeholder="https://x.com/..."
                  value={settings.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="linkedin"><Linkedin size={13} /> LinkedIn</label>
                <input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/..."
                  value={settings.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="form-card">
            <h3>Homepage Hero</h3>

            <div className="form-field full-width">
              <label>Hero Image</label>
              <div className="image-upload">
                {settings.hero_image ? (
                  <div className="image-upload-preview">
                    <img src={settings.hero_image} alt="Hero preview" className="image-preview" />
                    <button
                      type="button"
                      className="image-upload-remove"
                      onClick={() => handleChange("hero_image", "")}
                    >
                      <X size={14} />
                      Remove
                    </button>
                  </div>
                ) : (
                  <label htmlFor="hero_image_file" className="image-upload-dropzone">
                    <ImagePlus size={22} />
                    <span>Click to choose an image from your computer</span>
                    <span className="field-hint">PNG, JPG or WEBP — up to 5MB</span>
                  </label>
                )}
                <input
                  id="hero_image_file"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="image-upload-input"
                  onChange={(e) => {
                    handleImageUpload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="pill-tabs" style={{ margin: "1rem 0" }}>
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`pill-tab ${heroTab === lang ? "active" : ""}`}
                  onClick={() => setHeroTab(lang)}
                >
                  {LANG_LABEL[lang]}
                </button>
              ))}
            </div>

            <div className="form-grid">
              <div className="form-field full-width">
                <label htmlFor={`hero_title_${heroTab}`}>Hero Title ({LANG_LABEL[heroTab]})</label>
                <input
                  id={`hero_title_${heroTab}`}
                  type="text"
                  dir={heroTab === "ar" ? "rtl" : "ltr"}
                  value={settings[`hero_title_${heroTab}`]}
                  onChange={(e) => handleChange(`hero_title_${heroTab}`, e.target.value)}
                />
              </div>

              <div className="form-field full-width">
                <label htmlFor={`hero_subtitle_${heroTab}`}>Hero Subtitle ({LANG_LABEL[heroTab]})</label>
                <input
                  id={`hero_subtitle_${heroTab}`}
                  type="text"
                  dir={heroTab === "ar" ? "rtl" : "ltr"}
                  value={settings[`hero_subtitle_${heroTab}`]}
                  onChange={(e) => handleChange(`hero_subtitle_${heroTab}`, e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* About */}
          <div className="form-card">
            <h3>About Section</h3>

            <div className="pill-tabs" style={{ marginBottom: "1rem" }}>
              {LANGS.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`pill-tab ${aboutTab === lang ? "active" : ""}`}
                  onClick={() => setAboutTab(lang)}
                >
                  {LANG_LABEL[lang]}
                </button>
              ))}
            </div>

            <textarea
              className="form-textarea"
              rows={5}
              dir={aboutTab === "ar" ? "rtl" : "ltr"}
              placeholder={`About the company (${LANG_LABEL[aboutTab]})`}
              value={settings[`about_${aboutTab}`]}
              onChange={(e) => handleChange(`about_${aboutTab}`, e.target.value)}
            />
          </div>

        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}