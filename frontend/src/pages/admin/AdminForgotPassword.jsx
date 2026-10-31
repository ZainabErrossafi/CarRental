import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { requestPasswordReset } from "../../services/Passwordresetapi.js";

export default function AdminForgotPassword() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (e.currentTarget.elements.email.validity.typeMismatch) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(cleanEmail);
      navigate("/reset-password", { state: { email: cleanEmail } });
    } catch (err) {
      setError(
        err.response?.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : err.response?.status === 503
            ? "We couldn't send the email right now. Please try again later."
            : err.response?.data?.email?.[0] ||
              err.response?.data?.detail ||
              "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-language-switcher">
          <LanguageSwitcher />
        </div>
        <div className="auth-logo">
          <div className="logo-dot" />
        </div>

        <h1 className="auth-title">
          {sent ? t("Check your email") : t("Forgot password?")}
        </h1>
        <p className="auth-subtitle">
          {sent
            ? t("We've sent password reset instructions to {value0}.", {
                value0: email,
              })
            : t("No worries, we'll email you a 6-digit verification code.")}
        </p>

        {error && (
          <p id="forgot-password-error" role="alert" className="auth-error" style={{ color: "#b42318" }}>
            {t(error)}
          </p>
        )}
        {!sent && (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-field">
              <label htmlFor="email">{t("Email")}</label>
              <input
                id="email"
                type="email"
                placeholder={t("Enter your email")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                name="email"
                autoComplete="email"
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? "forgot-password-error" : undefined}
                required
              />
            </div>

            <button type="submit" className="gcard-submit" disabled={loading}>
              {loading ? t("Sending...") : t("Reset password")}
            </button>
          </form>
        )}

        {sent && (
          <button
            type="button"
            className="btn btn-secondary auth-submit"
            onClick={() => setSent(false)}
          >
            <KeyRound size={16} />
            {t("Try another email")}
          </button>
        )}

        <p className="auth-footer">
          <Link
            to="/login"
            className="auth-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <ArrowLeft size={15} />
            {t("Back to log in")}
          </Link>
        </p>
      </div>
    </div>
  );
}
