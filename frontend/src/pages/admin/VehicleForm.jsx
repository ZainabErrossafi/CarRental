import { useI18n } from "../../context/I18nContext";
import { useRef, useState } from "react";
import { X, ImagePlus, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = ["Vehicle Details", "Photo & Description"];

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
  multiStep = false,
}) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const formRef = useRef(null);

  const isLastStep = !multiStep || step === STEPS.length - 1;
  // show(0) -> step 1, show(1) -> step 2. Everything shows when multiStep is off.
  const show = (n) => !multiStep || step === n;

  const goNext = () => {
    if (formRef.current && !formRef.current.reportValidity()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    // Pressing Enter on step 1 should go to the next step, not save
    if (!isLastStep) {
      e.preventDefault();
      goNext();
      return;
    }
    onSubmit(e);
  };

  return (
    <>
      {multiStep && (
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
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">

          {/* ================= STEP 1 ================= */}
          {show(0) && (
            <>
              {/* Identity */}
              <div className="form-card vehicle-identity-card">
                <div className="vehicle-identity-heading">
                  <h3>{t("Vehicle identity")}</h3>
                  <p>{t("Start with the details customers will use to find your vehicle.")}</p>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="brand">{t("Brand / Make")}</label>
                    <input
                      id="brand"
                      type="text"
                      placeholder={t("e.g. Toyota")}
                      value={form.brand}
                      onChange={(e) => onChange("brand", e.target.value)}
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
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      value={form.year}
                      onChange={(e) => onChange("year", Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="category">{t("Vehicle category")}</label>
                    <select
                      id="category"
                      className="select-lg"
                      aria-describedby="vehicle-category-hint"
                      value={form.category}
                      onChange={(e) => onChange("category", e.target.value)}
                      required
                    >
                      {CATEGORY_OPTIONS.map((group) => (
                        <optgroup key={group.group} label={t(group.group)}>
                          {group.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {t(opt.label)}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <span id="vehicle-category-hint" className="field-hint">
                      {t("Choose the category customers will browse to find this vehicle.")}
                    </span>
                  </div>

                  <label className="vehicle-featured-control full-width">
                    <span className="vehicle-featured-copy">
                      <span className="vehicle-featured-title">{t("Featured vehicle")}</span>
                      <span className="field-hint" id="vehicle-featured-hint">
                        {t("Highlight this vehicle on the site to help it stand out.")}
                      </span>
                    </span>
                    <input
                      className="vehicle-featured-input"
                      type="checkbox"
                      role="switch"
                      aria-describedby="vehicle-featured-hint"
                      checked={!!form.is_featured}
                      onChange={(e) => onChange("is_featured", e.target.checked)}
                    />
                    <span className="vehicle-featured-switch" aria-hidden="true" />
                  </label>
                </div>
              </div>

              {/* Specs */}
              <div className="form-card vehicle-details-card vehicle-specs-card">
                <div className="vehicle-identity-heading">
                  <h3>{t("Vehicle specifications")}</h3>
                  <p>{t("Add the practical details customers need before booking.")}</p>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="transmission">{t("Transmission")}</label>
                    <select
                      id="transmission"
                      value={form.transmission}
                      onChange={(e) => onChange("transmission", e.target.value)}
                    >
                      <option value="Manual">{t("Manual")}</option>
                      <option value="Automatic">{t("Automatic")}</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="fuel">{t("Fuel Type")}</label>
                    <select
                      id="fuel"
                      value={form.fuel}
                      onChange={(e) => onChange("fuel", e.target.value)}
                    >
                      <option value="Diesel">{t("Diesel")}</option>
                      <option value="Gasoline">{t("Gasoline (Essence)")}</option>
                      <option value="Hybrid">{t("Hybrid")}</option>
                      <option value="Electric">{t("Electric")}</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="seats">{t("Seats")}</label>
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
                    <label htmlFor="doors">{t("Doors")}</label>
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
                    <label htmlFor="luggage">{t("Luggage Capacity")}</label>
                    <input
                      id="luggage"
                      type="number"
                      min="0"
                      value={form.luggage}
                      onChange={(e) => onChange("luggage", Number(e.target.value))}
                    />
                    <span className="field-hint">{t("Number of standard suitcases it fits.")}</span>
                  </div>

                  <label className="vehicle-featured-control full-width">
                    <span className="vehicle-featured-copy">
                      <span className="vehicle-featured-title">{t("Air conditioning")}</span>
                      <span className="field-hint" id="vehicle-ac-hint">
                        {t("Keep passengers comfortable on warm days.")}
                      </span>
                    </span>
                    <input
                      className="vehicle-featured-input"
                      type="checkbox"
                      role="switch"
                      aria-describedby="vehicle-ac-hint"
                      checked={!!form.air_conditioning}
                      onChange={(e) => onChange("air_conditioning", e.target.checked)}
                    />
                    <span className="vehicle-featured-switch" aria-hidden="true" />
                  </label>
                </div>
              </div>

              {/* Pricing & Rental Rules */}
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
                        min="0"
                        step="10"
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
                        min="0"
                        step="50"
                        value={form.deposit}
                        onChange={(e) => onChange("deposit", Number(e.target.value))}
                      />
                      <span className="input-suffix">{t("MAD")}</span>
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="daily_mileage_limit">{t("Daily Mileage Limit")}</label>
                    <div className="input-group">
                      <input
                        id="daily_mileage_limit"
                        type="number"
                        min="0"
                        step="10"
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
                        min="18"
                        max="99"
                        value={form.min_driver_age}
                        onChange={(e) => onChange("min_driver_age", Number(e.target.value))}
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
                        min="0"
                        max="30"
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
            </>
          )}

          {/* ================= STEP 2 ================= */}
          {show(1) && (
            <>
              {/* Media */}
              <div className="form-card vehicle-details-card vehicle-media-card">
                <div className="vehicle-identity-heading">
                  <h3>{t("Vehicle photo")}</h3>
                  <p>{t("Choose a clear photo that shows your vehicle at its best.")}</p>
                </div>
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label htmlFor="main_image_file">{t("Main image")}</label>

                    <div className="image-upload">
                      {form.main_image ? (
                        <div className="image-upload-preview">
                          <img
                            src={form.main_image}
                            alt={t("Preview")}
                            className="image-preview"
                          />
                          <button
                            type="button"
                            className="image-upload-remove"
                            onClick={() => onChange("main_image", "")}
                          >
                            <X size={14} />
                            {t("Remove")}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="image-upload-dropzone"
                          onClick={() =>
                            document.getElementById("main_image_file").click()
                          }
                        >
                          <ImagePlus size={22} />
                          <span className="vehicle-upload-title">{t("Choose a vehicle photo")}</span>
                          <span className="vehicle-upload-caption">
                            {t("Browse files on your computer")}
                          </span>
                          <span className="field-hint">{t("PNG, JPG or WEBP — up to 5MB")}</span>
                        </button>
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
                            alert(t("Image is too large. Please choose a file under 5MB."));
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

              {/* Description */}
              <div className="form-card vehicle-description-card">
                <div className="vehicle-description-heading">
                  <h3>
                    <label htmlFor="vehicle-description">{t("Description")}</label>
                  </h3>
                  <p id="vehicle-description-hint">
                    {t("Help customers get to know this vehicle. Include its comfort, features, and what makes it a good choice.")}
                  </p>
                </div>
                <textarea
                  id="vehicle-description"
                  className="vehicle-description-input"
                  rows={6}
                  lang="en"
                  placeholder={t("For example: A comfortable, fuel-efficient car for city trips and weekend getaways…")}
                  aria-describedby="vehicle-description-hint"
                  value={form.description_en ?? ""}
                  onChange={(e) => onChange("description_en", e.target.value)}
                />
                <div className="vehicle-description-footer">
                  <span>{t("Write your description in English.")}</span>
                  <span>{t("{count} characters", { count: (form.description_en ?? "").length })}</span>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="form-actions step-actions">
          {step === 0 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={saving}
            >
              {t("Cancel")}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goBack}
              disabled={saving}
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
              {t(saving ? savingLabel : submitLabel)}
            </button>
          )}
        </div>
      </form>
    </>
  );
}