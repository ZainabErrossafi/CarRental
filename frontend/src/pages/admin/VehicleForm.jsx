import UploadProgress from "../../components/UploadProgress";
import useImageReader from "../../hooks/useImageReader";
import { useI18n } from "../../context/I18nContext";
import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, ChevronLeft, ChevronRight } from "lucide-react";

import SearchableSelect from "../../components/SearchableSelect";

import { getCatalog } from "../../services/adminApi";

const STEPS = ["Vehicle Details", "Photo & Description"];

export const EMPTY_VEHICLE = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  category: "",
  feature_ids: [],
  brand_id: "",
  category_id: "",
  status: "available",
  dailyRate: "",
  deposit: "",
  daily_mileage_limit: "",
  min_driver_age: 21,
  min_license_years: 1,
  transmission: "manual",
  fuel: "diesel",
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
  uploadProgress,
  uploadCompleteLabel = "Creating vehicle…",
  submitLabel = "Save Changes",
  savingLabel = "Saving...",
  multiStep = false,
}) {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [imageError, setImageError] = useState(null);
  const { readImage, progress: imageProgress } = useImageReader(
    (image) => onChange("main_image", image), setImageError,
  );
  const formRef = useRef(null);
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getCatalog().then((data) => { if (!cancelled) setCatalog(data); })
      .catch((error) => { if (!cancelled) setCatalogError(error.message); });
    return () => { cancelled = true; };
  }, []);


  const isLastStep = !multiStep || step === STEPS.length - 1;
  // show(0) -> step 1, show(1) -> step 2. Everything shows when multiStep is off.
  const show = (n) => !multiStep || step === n;

  const goNext = (event) => {
    // Cancel the click's default action before rendering the submit button.
    event?.preventDefault();
    if (formRef.current && !formRef.current.reportValidity()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    if (saving || imageProgress !== null) { e.preventDefault(); return; }
    // Pressing Enter on step 1 should go to the next step, not save
    if (!isLastStep) {
      e.preventDefault();
      goNext();
      return;
    }
    if (!catalog || catalogError) { e.preventDefault(); return; }
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

      {catalogError && <div role="alert" className="alert alert-error">{t(catalogError)}</div>}
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
                    <SearchableSelect
                      id="brand"
                      value={form.brand_id}
                      onChange={(value) => onChange("brand_id", value ?? "")}
                      options={catalog?.brands.map((item) => ({ value: item.id, label: item.name })) ?? []}
                      placeholder={t("Brands")}
                      disablePortal
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
                      step="any"
                      min="0"

                      value={form.year}
                      onChange={(e) => onChange("year", Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-field full-width">
                    <label htmlFor="category">{t("Vehicle category")}</label>
                    <SearchableSelect
                      id="category"
                      value={form.category_id}
                      onChange={(value) => onChange("category_id", value ?? "")}
                      options={catalog?.categories.map((item) => ({ value: item.id, label: item.name })) ?? []}
                      placeholder={t("Categories")}
                      disablePortal
                      required
                    />
                    <span id="vehicle-category-hint" className="field-hint">
                      {t("Choose the category customers will browse to find this vehicle.")}
                    </span>
                  </div>

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
                    <SearchableSelect
                      id="transmission"
                      value={form.transmission}
                      onChange={(value) => onChange("transmission", value ?? "")}
                      options={[{ value: "manual", label: t("Manual") }, { value: "automatic", label: t("Automatic") }]}
                      placeholder={t("Transmission")}
                      disablePortal

                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="fuel">{t("Fuel Type")}</label>
                    <SearchableSelect
                      id="fuel"
                      value={form.fuel}
                      onChange={(value) => onChange("fuel", value ?? "")}
                      options={[{ value: "diesel", label: t("Diesel") }, { value: "petrol", label: t("Gasoline (Essence)") }, { value: "hybrid", label: t("Hybrid") }, { value: "electric", label: t("Electric") }]}
                      placeholder={t("Fuel Type")}
                      disablePortal

                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="seats">{t("Seats")}</label>
                    <input
                      id="seats"
                      type="number"
                      step="any"
                      min="0"

                      value={form.seats}
                      onChange={(e) => onChange("seats", Number(e.target.value))}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="doors">{t("Doors")}</label>
                    <input
                      id="doors"
                      type="number"
                      step="any"
                      min="0"

                      value={form.doors}
                      onChange={(e) => onChange("doors", Number(e.target.value))}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="luggage">{t("Luggage Capacity")}</label>
                    <input
                      id="luggage"
                      type="number"
                      step="any"
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

              <div className="form-card vehicle-details-card">
                <div className="vehicle-identity-heading">
                  <h3 id="vehicle-features-heading">{t("Features")}</h3>
                  <p>{t("Select the equipment included with this vehicle.")}</p>
                </div>
                <div className="vehicle-features-grid" role="group" aria-labelledby="vehicle-features-heading">
                  {catalog?.features.map((feature) => (
                    <label className="vehicle-feature-option" key={feature.id}>
                      <input type="checkbox" disabled={saving}
                        checked={(form.feature_ids ?? []).includes(feature.id)}
                        onChange={(event) => onChange("feature_ids", event.target.checked
                          ? [...(form.feature_ids ?? []), feature.id]
                          : (form.feature_ids ?? []).filter((id) => id !== feature.id))} />
                      <span>{feature[`name_${lang}`] || feature.name}</span>
                    </label>
                  ))}
                </div>
                {catalog && catalog.features.length === 0 && <p className="field-hint">{t("No features available. Add features in Catalog first.")}</p>}
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
                    <label htmlFor="daily_mileage_limit">{t("Daily Mileage Limit")}</label>
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
            </>
          )}

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

                    {imageError && <div className="alert alert-error" role="alert">{t(imageError)}</div>}
                    {imageProgress !== null && <UploadProgress value={imageProgress} label="Reading image…" />}
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
                            disabled={saving || imageProgress !== null}
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
                          disabled={saving || imageProgress !== null}
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
                        disabled={saving || imageProgress !== null}
                        accept="image/png, image/jpeg, image/webp"
                        className="image-upload-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.size > 5 * 1024 * 1024) {
                            setImageError("Image is too large. Please choose a file under 5MB.");
                            e.target.value = "";
                            return;
                          }

                          setImageError(null);
                          readImage(file);
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

        {saving && uploadProgress !== undefined && (
          <UploadProgress
            value={uploadProgress}
            label={uploadProgress === 100 ? uploadCompleteLabel : "Uploading vehicle…"}
          />
        )}

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
            <button key="next" type="button" className="btn btn-primary" onClick={goNext}>
              {t("Next")} <ChevronRight size={16} />
            </button>
          ) : (
            <button key="save" type="submit" className="btn btn-primary" disabled={saving || imageProgress !== null || !catalog || !!catalogError}>
              {t(saving ? savingLabel : submitLabel)}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
