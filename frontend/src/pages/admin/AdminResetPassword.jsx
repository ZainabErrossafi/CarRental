import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "../../services/Passwordresetapi.js";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { useI18n } from "../../context/I18nContext";

export default function AdminResetPassword() {
  const { t } = useI18n();
  const email = useLocation().state?.email;
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const errorText = (err) => {
    const data = err.response?.data;
    return data?.new_password?.[0] || data?.code?.[0] || data?.detail ||
      (err.response?.status === 429
        ? "Too many attempts. Please wait a minute and try again."
        : "Something went wrong. Please try again.");
  };

  async function verifyCode(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyPasswordResetCode({ email, code });
      setVerified(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await confirmPasswordReset({ email, code, newPassword: password });
      setDone(true);
    } catch (err) {
      // Code expired or was invalidated meanwhile: send the user back to the code step.
      if (err.response?.data?.detail) { setVerified(false); setCode(""); }
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }

  if (!email) return <Navigate to="/forgot-password" replace />;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-language-switcher"><LanguageSwitcher /></div>
        <div className="auth-logo"><div className="logo-dot" /></div>
        <h1 className="auth-title">{t(done ? "Password updated" : verified ? "Choose a new password" : "Enter verification code")}</h1>
        <p className="auth-subtitle">{t(done ? "Your password has been changed. You can now log in." : verified ? "Enter and confirm your new password." : "Enter the 6-digit code we emailed you.")}</p>
        {error && <p role="alert" className="auth-error">{t(error)}</p>}
        {!verified && !done && (
          <form className="auth-form" onSubmit={verifyCode}>
            <div className="form-field">
              <label htmlFor="otp-code">{t("Verification code")}</label>
              <input id="otp-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            </div>
            <button type="submit" className="gcard-submit" disabled={loading || code.length !== 6}>{t(loading ? "Verifying..." : "Verify code")}</button>
          </form>
        )}
        {verified && !done && (
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
        {!done && <p className="auth-footer"><Link className="auth-link" to="/forgot-password">{t("Request a new code")}</Link></p>}
        <p className="auth-footer"><Link className="auth-link" to="/login">{t("Back to log in")}</Link></p>
      </div>
    </div>
  );
}