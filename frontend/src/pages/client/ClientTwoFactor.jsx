import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { resendVerification } from "../../services/authApi";

export default function ClientTwoFactor() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = sessionStorage.getItem("rently_verification_email");
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const inputs = useRef([]);
  const code = digits.join("");

  const change = (index, value) => {
    const next = [...digits];
    next[index] = value.replace(/\D/g, "").slice(-1);
    setDigits(next);
    setError("");
    if (next[index]) inputs.current[index + 1]?.focus();
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy || code.length !== 6 || !email) return;
    setBusy(true);
    setError("");
    try {
      await verifyEmail({ email, code });
      const from = location.state?.from;
      const target = /^\/vehicles\/[^/]+$/.test(from?.pathname || "")
        ? from.pathname + (from.search || "") + (from.hash || "") : "/";
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    if (busy || !email) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await resendVerification(email);
      setNotice(result.detail);
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon-circle"><ShieldCheck size={20} /></div>
        <h1 className="auth-title">Two-factor authentication</h1>
        <p className="auth-subtitle">Enter the six-digit code sent to <strong>{email || "your email"}</strong>.</p>
        {!email && <p role="alert">Your verification session has expired. Please sign in again.</p>}
        {error && <p className="alert alert-error mb-4" role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        <form className="auth-form" onSubmit={submit} style={{ alignItems: "center" }}>
          <div className="otp-inputs" onPaste={(event) => {
            const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!pasted) return;
            event.preventDefault();
            setDigits(Array.from({ length: 6 }, (_, index) => pasted[index] || ""));
            setError("");
            inputs.current[pasted.length - 1]?.focus();
          }}>
            {digits.map((digit, index) => (
              <input key={index} ref={(input) => { inputs.current[index] = input; }} className="otp-input"
                aria-label={`Code digit ${index + 1}`} inputMode="numeric" maxLength={1}
                autoComplete={index === 0 ? "one-time-code" : "off"} value={digit} disabled={busy || !email}
                onChange={(event) => change(index, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !digit) inputs.current[index - 1]?.focus();
                }} />
            ))}
          </div>
          <button className="gcard-submit" disabled={busy || !email || code.length !== 6}>
            {busy ? "Verifying…" : "Verify code"}
          </button>
        </form>
        <p className="auth-footer">Didn't receive the email? <button type="button" className="auth-link"
          disabled={busy || !email} onClick={resend}>Click to resend</button></p>
        <p className="auth-footer"><Link to="/login" className="auth-link">Back to log in</Link></p>
      </div>
    </div>
  );
}
