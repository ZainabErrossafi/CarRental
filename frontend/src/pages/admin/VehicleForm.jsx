import { useState } from "react";
import { X, ImagePlus } from "lucide-react";

const CATEGORY_OPTIONS = [
  {
    group: "Standard & Daily",
    options: [
      { value: "Economy", label: "Economy (e.g. Dacia Logan, Renault Clio)" },
      { value: "Compact", label: "Compact (e.g. Golf, Peugeot 208)" },
      { value: "Sedan", label: "Sedan (e.g. Passat, Mercedes C-Class)" },
    ],
  },
  {
    group: "SUVs & Off-Road",
    options: [
      { value: "Compact SUV", label: "Compact SUV (e.g. Duster, T-Roc)" },
      { value: "Full-Size SUV", label: "Full-Size SUV (e.g. Touareg, Prado)" },
      { value: "4x4 / Off-Road", label: "4x4 / Off-Road (e.g. Wrangler, Defender)" },
    ],
  },
  {
    group: "Luxury & Specialty",
    options: [
      { value: "Executive", label: "Executive (e.g. BMW 5 Series, Audi A6)" },
      { value: "Luxury", label: "Luxury / Premium (e.g. Range Rover, S-Class)" },
      { value: "Convertible", label: "Convertible / Sports" },
    ],
  },
  {
    group: "Vans & Group Travel",
    options: [
      { value: "Minivan", label: "Minivan (7-9 Seats)" },
      { value: "Commercial Van", label: "Cargo / Commercial Van" },
    ],
  },
];

export const EMPTY_VEHICLE = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "Economy",
  status: "available",
  dailyRate: "",
  deposit: "",
  daily_mileage_limit: "",
  min_driver_age: 21,
  min_license_years: 1,
  transmission: "Manual",
  fuel: "Diesel",
  seats: 5,
  doors: 4,
  luggage: 0,
  air_conditioning: false,
  is_featured: false,
  main_image: "",
  description_en: "",
  description_fr: "",
  description_ar: "",
};

export default function VehicleForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  submitLabel = "Save Changes",
  savingLabel = "Saving...",
}) {
  const [descTab, setDescTab] = useState("en");

  return (
    <form onSubmit={onSubmit} className="vehicle-form">
      <div className="form-sections">

        {/* Identity */}
        <div className="form-card">
          <h3>Identity</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="brand">Brand / Make</label>
              <input
                id="brand"
                type="text"
                value={form.brand}
                onChange={(e) => onChange("brand", e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                type="text"
                value={form.model}
                onChange={(e) => onChange("model", e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={(e) => onChange("year", Number(e.target.value))}
                required
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="category">Vehicle Category / Fleet Segment</label>
              <select
                id="category"
                className="select-lg"
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                required
              >
                {CATEGORY_OPTIONS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="field-hint">
                Determines how this car is listed and filtered in the public catalog.
              </span>
            </div>

            <div className="form-field checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!form.is_featured}
                  onChange={(e) => onChange("is_featured", e.target.checked)}
                />
                Featured vehicle
              </label>
              <span className="field-hint">Shown in highlighted spots on the site.</span>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="form-card">
          <h3>Vehicle Specs</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="transmission">Transmission</label>
              <select
                id="transmission"
                value={form.transmission}
                onChange={(e) => onChange("transmission", e.target.value)}
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="fuel">Fuel Type</label>
              <select
                id="fuel"
                value={form.fuel}
                onChange={(e) => onChange("fuel", e.target.value)}
              >
                <option value="Diesel">Diesel</option>
                <option value="Gasoline">Gasoline (Essence)</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="seats">Seats</label>
              <input
                id="seats"
                type="number"
                min="2"
                max="15"
                value={form.seats}
                onChange={(e) => onChange("seats", Number(e.target.value))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="doors">Doors</label>
              <input
                id="doors"
                type="number"
                min="2"
                max="6"
                value={form.doors}
                onChange={(e) => onChange("doors", Number(e.target.value))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="luggage">Luggage Capacity</label>
              <input
                id="luggage"
                type="number"
                min="0"
                value={form.luggage}
                onChange={(e) => onChange("luggage", Number(e.target.value))}
              />
              <span className="field-hint">Number of standard suitcases it fits.</span>
            </div>

            <div className="form-field checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!form.air_conditioning}
                  onChange={(e) => onChange("air_conditioning", e.target.checked)}
                />
                Air Conditioning
              </label>
            </div>
          </div>
        </div>

        {/* Pricing & Rental Rules */}
        <div className="form-card">
          <h3>Pricing & Rental Rules</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="dailyRate">Daily Rate</label>
              <div className="input-group">
                <input
                  id="dailyRate"
                  type="number"
                  min="0"
                  step="10"
                  value={form.dailyRate}
                  onChange={(e) => onChange("dailyRate", Number(e.target.value))}
                  required
                />
                <span className="input-suffix">MAD/day</span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="deposit">Security Deposit</label>
              <div className="input-group">
                <input
                  id="deposit"
                  type="number"
                  min="0"
                  step="50"
                  value={form.deposit}
                  onChange={(e) => onChange("deposit", Number(e.target.value))}
                />
                <span className="input-suffix">MAD</span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="daily_mileage_limit">Daily Mileage Limit</label>
              <div className="input-group">
                <input
                  id="daily_mileage_limit"
                  type="number"
                  min="0"
                  step="10"
                  value={form.daily_mileage_limit}
                  onChange={(e) => onChange("daily_mileage_limit", Number(e.target.value))}
                />
                <span className="input-suffix">km/day</span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="min_driver_age">Minimum Driver Age</label>
              <div className="input-group">
                <input
                  id="min_driver_age"
                  type="number"
                  min="18"
                  max="99"
                  value={form.min_driver_age}
                  onChange={(e) => onChange("min_driver_age", Number(e.target.value))}
                />
                <span className="input-suffix">years</span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="min_license_years">Minimum License Held</label>
              <div className="input-group">
                <input
                  id="min_license_years"
                  type="number"
                  min="0"
                  max="30"
                  value={form.min_license_years}
                  onChange={(e) => onChange("min_license_years", Number(e.target.value))}
                />
                <span className="input-suffix">years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="form-card">
          <h3>Media</h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label htmlFor="main_image">Main Image</label>

              <div className="image-upload">
                {form.main_image ? (
                  <div className="image-upload-preview">
                    <img src={form.main_image} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      className="image-upload-remove"
                      onClick={() => onChange("main_image", "")}
                    >
                      <X size={14} />
                      Remove
                    </button>
                  </div>
                ) : (
                  <label htmlFor="main_image_file" className="image-upload-dropzone">
                    <ImagePlus size={22} />
                    <span>Click to choose an image from your computer</span>
                    <span className="field-hint">PNG, JPG or WEBP — up to 5MB</span>
                  </label>
                )}

                <input
                  id="main_image_file"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="image-upload-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 5 * 1024 * 1024) {
                      alert("Image is too large. Please choose a file under 5MB.");
                      e.target.value = "";
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => onChange("main_image", reader.result);
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="form-card">
          <h3>Descriptions</h3>

          <div className="pill-tabs" style={{ marginBottom: "1rem" }}>
            {["en", "fr", "ar"].map((lang) => (
              <button
                key={lang}
                type="button"
                className={`pill-tab ${descTab === lang ? "active" : ""}`}
                onClick={() => setDescTab(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {descTab === "en" && (
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Description (English)"
              value={form.description_en}
              onChange={(e) => onChange("description_en", e.target.value)}
            />
          )}
          {descTab === "fr" && (
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Description (Français)"
              value={form.description_fr}
              onChange={(e) => onChange("description_fr", e.target.value)}
            />
          )}
          {descTab === "ar" && (
            <textarea
              className="form-textarea"
              rows={4}
              dir="rtl"
              placeholder="الوصف (عربي)"
              value={form.description_ar}
              onChange={(e) => onChange("description_ar", e.target.value)}
            />
          )}
        </div>

      </div>

      {/* Footer Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}