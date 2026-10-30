import { useI18n } from "../../../context/I18nContext";

export default function VehicleDescriptionField({ form, onChange }) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-description-card">
      <div className="vehicle-description-heading">
        <h3>
          <label htmlFor="vehicle-description">{t("Description")}</label>
        </h3>
        <p id="vehicle-description-hint">
          {t(
            "Help customers get to know this vehicle. Include its comfort, features, and what makes it a good choice.",
          )}
        </p>
      </div>
      <textarea
        id="vehicle-description"
        className="vehicle-description-input"
        rows={6}
        lang="en"
        placeholder={t(
          "For example: A comfortable, fuel-efficient car for city trips and weekend getaways…",
        )}
        aria-describedby="vehicle-description-hint"
        value={form.description_en ?? ""}
        onChange={(e) => onChange("description_en", e.target.value)}
      />
      <div className="vehicle-description-footer">
        <span>{t("Write your description in English.")}</span>
        <span>
          {t("{count} characters", {
            count: (form.description_en ?? "").length,
          })}
        </span>
      </div>
    </div>
  );
}
