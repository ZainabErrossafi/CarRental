import { resendVerification } from "../../services/authApi";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { useI18n } from "../../context/I18nContext";
import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CODE_LENGTH = 4;

export default function AdminVerifyEmail() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();
  const signupEmail = location.state?.email || sessionStorage.getItem("rently_verification_email");
  const email = signupEmail || t("your email");

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const inputRefs = useRef([]);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH;

  const handleChange = (index, value) => {
    // Only keep the last digit typed, digits only.
    const digit = value.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();

    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete || !signupEmail) return;

    setLoading(true);
    setError(null);

    try {
      await verifyEmail({ email: signupEmail, code });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!signupEmail || loading) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await resendVerification(signupEmail);
      setNotice(result.detail);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-language-switcher"><LanguageSwitcher /></div>
        <div className="auth-icon-circle">
          <Mail size={20} />
        </div>

        <h1 className="auth-title">{t("Check your email")}</h1>
        <p className="auth-subtitle">
          {t("Email verification")} <strong>{email}</strong>
        </p>

        {error && <div className="alert alert-error mb-4">⚠️ {t(error)}</div>}

        <p>{t("Email verification is not available yet. You can sign in with your username and password.")}</p>

        {notice && <p role="status">{t(notice)}</p>}
        {!signupEmail && <p><Link to="/signup">{t("Sign Up")}</Link></p>}

        <form onSubmit={handleSubmit} className="auth-form" style={{ alignItems: "center" }}>
          <div className="otp-inputs" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button
            type="submit"
            className="gcard-submit"
            disabled={!isComplete || loading || !signupEmail}
          >
            {loading ? t("Verifying...") : t("Verify email")}
          </button>
        </form>

        <p className="auth-footer">
          {t("Didn't receive the email?")}{" "}
          <button type="button" className="auth-link" onClick={handleResend} disabled={loading || !signupEmail}>
            {t("Click to resend")}
          </button>
        </p>

        <p className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <ArrowLeft size={15} />
            {t("Back to log in")}
          </Link>
        </p>
      </div>
    </div>
  );
}