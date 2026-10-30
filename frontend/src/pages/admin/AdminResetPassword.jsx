import { useI18n } from "../../context/I18nContext";
import { useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import { confirmPasswordReset, requestPasswordReset, verifyPasswordResetCode }
from "../../services/Passwordresetapi";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";

const N = 6;
const msg = (e) => e.response?.data?.detail || e.response?.data?.new_password?.[0] || "Something went wrong. Please try again.";

export default function AdminResetPassword() {
  const { t } = useI18n();
  const email = useLocation().state?.email;
  const [d, setD] = useState(Array(N).fill(""));
  const [step, setStep] = useState("code");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refs = useRef([]);
  const code = d.join("");

  if (!email) return <Navigate to="/forgot-password" replace />;

  const clear = () => { setD(Array(N).fill("")); refs.current[0]?.focus(); };
  const change = (i, v) => {
    const x = v.replace(/\D/g, "").slice(-1);
    setD(d.map((c, j) => (j === i ? x : c)));
    if (x && i < N - 1) refs.current[i + 1]?.focus();
  };
  const paste = (e) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, N);
    e.preventDefault();
    setD(Array.from({ length: N }, (_, i) => p[i] || ""));
  };
  const run = (fn) => async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try { await fn(); } catch (err) { setError(msg(err)); } finally { setBusy(false); }
  };

  const verify = run(async () => { await verifyPasswordResetCode({ email, code }); setStep("password"); });
  const resend = run(async () => { await requestPasswordReset(email); clear(); });
  const save = run(async () => {
    if (pw !== pw2) throw { response: { data: { detail: "Passwords do not match." } } };
    try { await confirmPasswordReset({ email, code, newPassword: pw }); setStep("done"); }
    catch (err) { if (err.response?.data?.detail) { setStep("code"); clear(); } throw err; }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-language-switcher"><LanguageSwitcher /></div>
        {error && <div className="alert alert-error mb-4">⚠️ {t(error)}</div>}

        {step === "code" && (<>
          <div className="auth-icon-circle"><Mail size={20} /></div>
          <h1 className="auth-title">{t("Check your email")}</h1>
          <p className="auth-subtitle">{t("Email verification")} <strong>{email}</strong></p>
          <form onSubmit={verify} className="auth-form" style={{ alignItems: "center" }}>
            <div className="otp-inputs" onPaste={paste}>
              {d.map((c, i) => (
                <input key={i} ref={(el) => (refs.current[i] = el)} className="otp-input" inputMode="numeric"
                  maxLength={1} value={c} autoFocus={i === 0} onChange={(e) => change(i, e.target.value)}
                  onKeyDown={(e) => e.key === "Backspace" && !c && refs.current[i - 1]?.focus()} />
              ))}
            </div>
            <button className="gcard-submit" disabled={code.length < N || busy}>{t(busy ? "Verifying..." : "Verify code")}</button>
          </form>
          <p className="auth-footer">{t("Didn't receive the email?")}{" "}
            <button type="button" className="auth-link" onClick={resend} disabled={busy}>{t("Click to resend")}</button></p>
        </>)}

        {step === "password" && (<>
          <h1 className="auth-title">{t("Choose a new password")}</h1>
          <form onSubmit={save} className="auth-form">
            <input type="password" placeholder={t("New password")} minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} />
            <input type="password" placeholder={t("Confirm password")} minLength={8} required value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <button className="gcard-submit" disabled={busy}>{t(busy ? "Saving..." : "Change password")}</button>
          </form>
        </>)}

        {step === "done" && (<>
          <h1 className="auth-title">{t("Password updated")}</h1>
          <p className="auth-subtitle">{t("Your password has been changed. You can now log in.")}</p>
        </>)}

        <p className="auth-footer"><Link to="/login" className="auth-link">{t("Back to log in")}</Link></p>
      </div>
    </div>
  );
}