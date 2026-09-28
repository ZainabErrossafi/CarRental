import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

const CODE_LENGTH = 4;

export default function AdminVerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
    if (!isComplete) return;

    setLoading(true);
    setError(null);

    // No real backend yet — just simulate verification.
    await new Promise((res) => setTimeout(res, 500));
    setLoading(false);

    navigate("/admin", { replace: true });
  };

  const handleResend = () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    setError(null);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon-circle">
          <Mail size={20} />
        </div>

        <h1 className="auth-title">Check your email</h1>
        <p className="auth-subtitle">
          We sent a verification code to <strong>{email}</strong>
        </p>

        {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

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
            className="btn btn-primary auth-submit"
            disabled={!isComplete || loading}
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive the email?{" "}
          <button type="button" className="auth-link" onClick={handleResend}>
            Click to resend
          </button>
        </p>

        <p className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <ArrowLeft size={15} />
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}