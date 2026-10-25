import { useState } from "react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { useI18n } from "../../context/I18nContext";

export default function AdminResetPassword() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setError("This form is a preview. Password changes are not connected yet.");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-language-switcher"><LanguageSwitcher /></div>
        <div className="auth-logo"><div className="logo-dot" /></div>
        <h1 className="auth-title">{t(done ? "Password updated" : "Choose a new password")}</h1>
        <p className="auth-subtitle">{t(done ? "Your password has been changed. You can now log in." : "Enter and confirm your new password.")}</p>
        {error && <p role="alert" className="auth-error">{t(error)}</p>}
        {!done && (
          <form className="auth-form" onSubmit={submit}>
            <div className="form-field">
              <label htmlFor="new-password">{t("New password")}</label>
              <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="confirm-password">{t("Confirm password")}</label>
              <input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            </div>
            <label><input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> {t("Show password")}</label>
            <button type="submit" className="gcard-submit" disabled={loading}>{t(loading ? "Saving..." : "Change password")}</button>
          </form>
        )}
        {!done && <p className="auth-footer"><Link className="auth-link" to="/forgot-password">{t("Request a new reset link")}</Link></p>}
        <p className="auth-footer"><Link className="auth-link" to="/login">{t("Back to log in")}</Link></p>
      </div>
    </div>
  );
}
