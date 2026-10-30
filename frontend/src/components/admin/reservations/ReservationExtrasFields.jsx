import { useI18n } from "../../../context/I18nContext";

export default function ReservationExtrasFields({
  form,
  availableExtras,
  handleExtraToggle,
}) {
  const { t } = useI18n();
  return (
    <>
      {availableExtras.length > 0 && (
        <div className="form-card vehicle-details-card">
          <h3>{t("Extras & Add-ons")}</h3>
          <div className="form-grid">
            {availableExtras.map((extra) => (
              <div key={extra.id} className="reservation-extra-option">
                <label>
                  <input
                    type="checkbox"
                    checked={form.extras.includes(extra.id)}
                    onChange={() => handleExtraToggle(extra.id)}
                  />
                  {extra.name}(
                  {[
                    Number(extra.price_per_day) > 0 &&
                      t("{value0} MAD/day", { value0: extra.price_per_day }),
                    Number(extra.flat_price) > 0 &&
                      t("{value0} MAD flat", { value0: extra.flat_price }),
                  ]
                    .filter(Boolean)
                    .join(" + ") || t("{value0} MAD flat", { value0: 0 })}
                  )
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
