import { useI18n } from "../../../context/I18nContext";
import { X, ImagePlus } from "lucide-react";
import UploadProgress from "../../UploadProgress";

export default function VehicleMediaFields({
  form,
  onChange,
  saving,
  imageProgress,
  imageError,
  setImageError,
  readImage,
}) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card vehicle-media-card">
      <div className="vehicle-identity-heading">
        <h3>{t("Vehicle photo")}</h3>
        <p>{t("Choose a clear photo that shows your vehicle at its best.")}</p>
      </div>
      <div className="form-grid">
        <div className="form-field full-width">
          <label htmlFor="main_image_file">{t("Main image")}</label>

          {imageError && (
            <div className="alert alert-error" role="alert">
              {t(imageError)}
            </div>
          )}
          {imageProgress !== null && (
            <UploadProgress value={imageProgress} label="Reading image…" />
          )}
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
                <span className="vehicle-upload-title">
                  {t("Choose a vehicle photo")}
                </span>
                <span className="vehicle-upload-caption">
                  {t("Browse files on your computer")}
                </span>
                <span className="field-hint">
                  {t("PNG, JPG or WEBP — up to 5MB")}
                </span>
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
                  setImageError(
                    "Image is too large. Please choose a file under 5MB.",
                  );
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
  );
}
