import { useI18n } from "../../../context/I18nContext";
import { X } from "lucide-react";

export default function UserFormDialog({
  closeCreate,
  handleSave,
  editing,
  saving,
  error,
  form,
  setForm,
}) {
  const { t } = useI18n();
  return (
    <div
      className="modal-overlay"
      onClick={closeCreate}
      onKeyDown={(event) => {
        if (event.key === "Escape") closeCreate();
      }}
    >
      <div
        className="modal-card modal-wide catalog-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <div className="modal-header">
            <h3 id="create-user-title">
              {t(editing ? "Edit User" : "Create User")}
            </h3>
            <button
              type="button"
              className="modal-close"
              onClick={closeCreate}
              disabled={saving}
              aria-label={t("Close")}
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal-body catalog-dialog-body">
            {error && (
              <p
                role="alert"
                style={{
                  color: "var(--danger, #b42318)",
                  whiteSpace: "pre-line",
                }}
              >
                {error}
              </p>
            )}
            {[
              ["username", "Username", "text", true, 150],
              ["email", "Email", "email", true, 254],
              ["password", "Password", "password", true, undefined],
              ["first_name", "First name", "text", false, 150],
              ["last_name", "Last name", "text", false, 150],
              ["phone", "Phone", "tel", false, 20],
            ]
              .filter(([name]) => !editing || name !== "password")
              .map(([name, label, type, required, maxLength]) => (
                <div className="form-field" key={name}>
                  <label
                    className="catalog-field-label"
                    htmlFor={`user-${name}`}
                  >
                    {t(label)}
                  </label>
                  <input
                    id={`user-${name}`}
                    type={type}
                    value={form[name]}
                    required={required}
                    maxLength={maxLength}
                    disabled={saving}
                    autoFocus={name === "username"}
                    autoComplete={
                      name === "password"
                        ? "new-password"
                        : name === "username"
                          ? "off"
                          : undefined
                    }
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [name]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            <div className="form-field">
              <label className="catalog-field-label" htmlFor="user-role">
                {t("Role")}
              </label>
              <select
                id="user-role"
                value={form.role}
                disabled={saving}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    role: event.target.value,
                  }))
                }
              >
                <option value="client">{t("Client")}</option>
                <option value="admin">{t("Admin")}</option>
              </select>
            </div>
            <label className="vehicle-featured-control">
              <span className="vehicle-featured-title">{t("Active")}</span>
              <input
                className="vehicle-featured-input"
                type="checkbox"
                role="switch"
                checked={form.is_active}
                disabled={saving}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    is_active: event.target.checked,
                  }))
                }
              />
              <span className="vehicle-featured-switch" aria-hidden="true" />
            </label>
          </div>
          <div className="modal-footer" style={{ gap: "0.6rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeCreate}
              disabled={saving}
            >
              {t("Cancel")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? t("Saving...")
                : t(editing ? "Save changes" : "Create User")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
