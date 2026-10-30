import { useI18n } from "../../../context/I18nContext";
import SearchableSelect from "../forms/SearchableSelect";

export default function ReservationCustomerFields({
  form,
  handleChange,
  users,
}) {
  const { t } = useI18n();
  return (
    <div className="form-card vehicle-details-card">
      <div className="vehicle-identity-heading">
        <h3>{t("Customer")}</h3>
        <p>{t("Select an existing customer or enter guest details below.")}</p>
      </div>
      <div className="form-grid">
        <div className="form-field full-width">
          <label htmlFor="user_id">{t("Registered User")}</label>
          <SearchableSelect
            disablePortal
            id="user_id"
            value={form.user_id}
            onChange={(value) => handleChange("user_id", value)}
            placeholder={t("Registered User")}
            options={[
              { value: "", label: t("Guest (No Account)") },
              ...users.map((user) => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name} (${user.email})`,
              })),
            ]}
          />
        </div>
      </div>
    </div>
  );
}
