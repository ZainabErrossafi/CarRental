import VehicleDescriptionField from "./VehicleDescriptionField.jsx";
import VehicleMediaFields from "./VehicleMediaFields.jsx";
import VehiclePricingFields from "./VehiclePricingFields.jsx";
import VehicleFeatureFields from "./VehicleFeatureFields.jsx";
import VehicleSpecificationFields from "./VehicleSpecificationFields.jsx";
import VehicleIdentityFields from "./VehicleIdentityFields.jsx";
import { useI18n } from "../../../context/I18nContext";
import UploadProgress from "../forms/UploadProgress";
import useImageReader from "../../../hooks/useImageReader";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getCatalog } from "../../../services/adminApi";

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
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [imageError, setImageError] = useState(null);
  const { readImage, progress: imageProgress } = useImageReader(
    (image) => onChange("main_image", image),
    setImageError,
  );
  const formRef = useRef(null);
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((error) => {
        if (!cancelled) setCatalogError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isLastStep = !multiStep || step === STEPS.length - 1;

  const show = (n) => !multiStep || step === n;

  const goNext = (event) => {

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
    if (saving || imageProgress !== null) {
      e.preventDefault();
      return;
    }

    if (!isLastStep) {
      e.preventDefault();
      goNext();
      return;
    }
    if (!catalog || catalogError) {
      e.preventDefault();
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

      {catalogError && (
        <div role="alert" className="alert alert-error">
          {t(catalogError)}
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-sections">

          {show(0) && (
            <>

              <VehicleIdentityFields
                form={form}
                onChange={onChange}
                catalog={catalog}
              />

              <VehicleSpecificationFields form={form} onChange={onChange} />

              <VehicleFeatureFields
                form={form}
                onChange={onChange}
                catalog={catalog}
                saving={saving}
              />

              <VehiclePricingFields form={form} onChange={onChange} />
            </>
          )}

          {show(1) && (
            <>

              <VehicleMediaFields
                form={form}
                onChange={onChange}
                saving={saving}
                imageProgress={imageProgress}
                imageError={imageError}
                setImageError={setImageError}
                readImage={readImage}
              />

              <VehicleDescriptionField form={form} onChange={onChange} />
            </>
          )}
        </div>

        {saving && uploadProgress !== undefined && (
          <UploadProgress
            value={uploadProgress}
            label={
              uploadProgress === 100
                ? uploadCompleteLabel
                : "Uploading vehicle…"
            }
          />
        )}

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
            <button
              key="next"
              type="button"
              className="btn btn-primary"
              onClick={goNext}
            >
              {t("Next")} <ChevronRight size={16} />
            </button>
          ) : (
            <button
              key="save"
              type="submit"
              className="btn btn-primary"
              disabled={
                saving || imageProgress !== null || !catalog || !!catalogError
              }
            >
              {t(saving ? savingLabel : submitLabel)}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
